const { pool, withTransaction } = require('../config/database');
const qualityInspectionRepository = require('../repositories/qualityInspection.repository');
const qualityInspectionPlanRepository = require('../repositories/qualityInspectionPlan.repository');
const qualityDefectCatalogRepository = require('../repositories/qualityDefectCatalog.repository');
const qualityCapaRepository = require('../repositories/qualityCapa.repository');
const inventoryService = require('./inventory.service');
const { generateInspectionNo } = require('../utils/qualityInspectionNoGenerator');
const { parsePagination, buildMeta } = require('../utils/pagination');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

// A report can only be edited (parameters/defects/decision) while it's actively being worked -
// REWORK_REQUIRED and the terminal states must go through reopenForRework/are locked entirely.
const EDITABLE_STATUSES = new Set(['UNDER_INSPECTION', 'HOLD']);

async function listPendingLots() {
  return qualityInspectionRepository.findPendingLots();
}

async function assembleDetail(inspection) {
  const [parameterResults, defects, statusHistory, capa] = await Promise.all([
    qualityInspectionRepository.findParameterResults(inspection.id, inspection.attempt_no),
    qualityInspectionRepository.findDefects(inspection.id, inspection.attempt_no),
    qualityInspectionRepository.findStatusHistory(inspection.id),
    qualityCapaRepository.findByInspectionId(inspection.id),
  ]);
  return { ...inspection, parameterResults, defects, statusHistory, capa };
}

async function getById(id) {
  const inspection = await qualityInspectionRepository.findById(id);
  if (!inspection) throw ApiError.notFound('Quality inspection not found');
  return assembleDetail(inspection);
}

async function list(query) {
  const { page, pageSize } = parsePagination(query);
  const { rows, total } = await qualityInspectionRepository.findAll({
    status: query.status,
    machineId: query.machineId,
    itemCode: query.itemCode,
    customerName: query.customerName,
    inspectorId: query.inspectorId,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    page,
    pageSize,
  });
  return { rows, meta: buildMeta({ page, pageSize, total }) };
}

/**
 * Opens a fresh Quality Inspection Report for a completed lot (produced_qty >= quantity).
 * One report ever exists per machine_planning row (enforced by a UNIQUE key) - once it exists,
 * further inspection passes go through reopenForRework, not another call here. Everything on
 * the header is a snapshot taken right now, so later edits to the source machine_planning row
 * never rewrite this report's history.
 */
async function startInspection(machinePlanningId, { inspectionType = 'FINAL' } = {}, req) {
  const lot = await qualityInspectionRepository.findMachinePlanningRow(machinePlanningId);
  if (!lot) throw ApiError.notFound('Machine planning row not found');
  if (!lot.machine_id) throw ApiError.badRequest('This lot has no machine assigned yet');
  if (Number(lot.produced_qty) < Number(lot.quantity)) {
    throw ApiError.badRequest('This lot is not yet fully produced');
  }

  const existing = await qualityInspectionRepository.findByMachinePlanningId(machinePlanningId);
  if (existing) {
    throw ApiError.conflict(
      `This lot already has inspection ${existing.inspection_no} (${existing.status}) - reopen it instead of starting a new one`
    );
  }

  const plan = await qualityInspectionPlanRepository.findMatchingPlan(lot.item_code, inspectionType);

  const inspectionId = await withTransaction(async (connection) => {
    const inspectionNo = await generateInspectionNo(connection);
    const id = await qualityInspectionRepository.create(
      {
        inspectionNo,
        machinePlanningId,
        orderNo: lot.order_no,
        lotNo: lot.lot_no,
        itemCode: lot.item_code,
        size: lot.size,
        itemName: lot.item_name,
        customerName: lot.customer_name,
        machineId: lot.machine_id,
        operatorName: lot.operator_name,
        shiftId: lot.shift_id,
        quantityProduced: lot.produced_qty,
        coilNo: lot.coil_no,
        grade: lot.grade,
        coilSize: lot.coil_size,
        coilWt: lot.coil_wt,
        inspectionPlanId: plan?.id,
        inspectionType,
        sampleSize: plan?.sample_size ?? 1,
        inspectionDatetime: new Date(),
        inspectorId: req.user?.id,
      },
      connection
    );
    await qualityInspectionRepository.insertStatusHistory(
      { inspectionId: id, fromStatus: null, toStatus: 'UNDER_INSPECTION', changedBy: req.user?.id, remarks: 'Inspection started' },
      connection
    );
    return id;
  });

  const inspection = await getById(inspectionId);
  await auditService.fromRequest(req, { action: 'CREATE', module: 'quality_inspection', recordId: inspectionId, newValue: inspection });
  return inspection;
}

function assertEditable(inspection) {
  if (!EDITABLE_STATUSES.has(inspection.status)) {
    throw ApiError.badRequest(`This inspection cannot be edited while it is ${inspection.status}`);
  }
}

/** Replaces this attempt's whole parameter-results set - the form always submits every row
 * together, so delete-then-insert (see the repository) is simpler than a per-row upsert. */
async function saveParameterResults(inspectionId, results, req) {
  const inspection = await qualityInspectionRepository.findById(inspectionId);
  if (!inspection) throw ApiError.notFound('Quality inspection not found');
  assertEditable(inspection);

  await qualityInspectionRepository.replaceParameterResults(inspectionId, inspection.attempt_no, results);

  await auditService.fromRequest(req, {
    action: 'UPDATE',
    module: 'quality_inspection',
    recordId: inspectionId,
    newValue: { parameterResults: results },
  });
  return qualityInspectionRepository.findParameterResults(inspectionId, inspection.attempt_no);
}

async function addDefect(inspectionId, data, req) {
  const inspection = await qualityInspectionRepository.findById(inspectionId);
  if (!inspection) throw ApiError.notFound('Quality inspection not found');
  assertEditable(inspection);

  const defect = await qualityDefectCatalogRepository.findById(data.defectCatalogId);
  if (!defect || !defect.is_active) throw ApiError.badRequest('Invalid or inactive defect code');

  const defectRowId = await qualityInspectionRepository.addDefect(
    inspectionId,
    inspection.attempt_no,
    { ...data, createdBy: req.user?.id },
    pool
  );

  await auditService.fromRequest(req, {
    action: 'CREATE',
    module: 'quality_inspection_defect',
    recordId: defectRowId,
    newValue: { inspectionId, ...data },
  });
  return qualityInspectionRepository.findDefects(inspectionId, inspection.attempt_no);
}

async function removeDefect(defectRowId, req) {
  const defectRow = await qualityInspectionRepository.findDefectById(defectRowId);
  if (!defectRow) throw ApiError.notFound('Defect entry not found');

  const inspection = await qualityInspectionRepository.findById(defectRow.inspection_id);
  assertEditable(inspection);

  await qualityInspectionRepository.removeDefect(defectRowId);
  await auditService.fromRequest(req, {
    action: 'DELETE',
    module: 'quality_inspection_defect',
    recordId: defectRowId,
    oldValue: defectRow,
  });
  return qualityInspectionRepository.findDefects(inspection.id, inspection.attempt_no);
}

/**
 * Records the inspector's decision: Approved / Approved with Deviation / Partially Accepted /
 * Rework Required / Rejected / Hold. Only possible while the report is actively being worked
 * (UNDER_INSPECTION or HOLD) - a Rework Required report must be reopened first.
 * quantity_accepted + quantity_rework + quantity_rejected can never exceed quantity_produced
 * (rework and rejected quantities never enter Finished Goods stock - only accepted does, via
 * releaseToInventory below); an optional CAPA record is created alongside the decision when
 * corrective/preventive action fields are supplied.
 */
async function recordDecision(inspectionId, data, req) {
  const inspection = await qualityInspectionRepository.findById(inspectionId);
  if (!inspection) throw ApiError.notFound('Quality inspection not found');
  assertEditable(inspection);

  const accepted = Number(data.quantityAccepted || 0);
  const rework = Number(data.quantityRework || 0);
  const rejected = Number(data.quantityRejected || 0);
  const produced = Number(inspection.quantity_produced);
  if (accepted + rework + rejected > produced) {
    throw ApiError.badRequest('Quantity accepted + rework + rejected cannot exceed quantity produced');
  }
  if (data.status === 'REJECTED' && !data.rejectionReason) {
    throw ApiError.badRequest('Rejection reason is required when the decision is Rejected');
  }

  await withTransaction(async (connection) => {
    await qualityInspectionRepository.recordDecision(inspectionId, data, connection);
    await qualityInspectionRepository.insertStatusHistory(
      {
        inspectionId,
        fromStatus: inspection.status,
        toStatus: data.status,
        changedBy: req.user?.id,
        remarks: data.remarks || data.rejectionReason || null,
      },
      connection
    );
    if (data.capa?.correctiveAction) {
      await qualityCapaRepository.create({ ...data.capa, inspectionId, createdBy: req.user?.id }, connection);
    }
  });

  const updated = await getById(inspectionId);
  await auditService.fromRequest(req, {
    action: 'DECISION',
    module: 'quality_inspection',
    recordId: inspectionId,
    oldValue: { status: inspection.status },
    newValue: updated,
  });
  return updated;
}

/** Reopens a Rework Required / Hold report for another inspection pass. A rework reopen bumps
 * attempt_no (a fresh measurement round, since physical rework happened in between) - a hold
 * reopen just resumes the same attempt, since nothing physically changed while it was held. */
async function reopenForRework(inspectionId, req) {
  const inspection = await qualityInspectionRepository.findById(inspectionId);
  if (!inspection) throw ApiError.notFound('Quality inspection not found');
  if (!['REWORK_REQUIRED', 'HOLD'].includes(inspection.status)) {
    throw ApiError.badRequest('Only a Rework Required or Hold inspection can be reopened');
  }

  const nextAttemptNo = inspection.status === 'REWORK_REQUIRED' ? inspection.attempt_no + 1 : inspection.attempt_no;

  await withTransaction(async (connection) => {
    await qualityInspectionRepository.reopenForRework(inspectionId, nextAttemptNo, connection);
    await qualityInspectionRepository.insertStatusHistory(
      {
        inspectionId,
        fromStatus: inspection.status,
        toStatus: 'UNDER_INSPECTION',
        changedBy: req.user?.id,
        remarks: inspection.status === 'REWORK_REQUIRED' ? 'Reopened for re-inspection after rework' : 'Resumed from Hold',
      },
      connection
    );
  });

  const updated = await getById(inspectionId);
  await auditService.fromRequest(req, {
    action: 'REOPEN',
    module: 'quality_inspection',
    recordId: inspectionId,
    oldValue: { status: inspection.status, attemptNo: inspection.attempt_no },
    newValue: { status: 'UNDER_INSPECTION', attemptNo: nextAttemptNo },
  });
  return updated;
}

/** Releases the accepted quantity into Finished Goods stock via inventory.service.js - an
 * explicit action, not automatic on approval, since "Release to Store" is its own distinct
 * workflow step per the spec. Eligible from any decision that left an accepted quantity on the
 * table (a full Approve, an Approve with Deviation, or a Partially Accepted lot where the rest
 * went to rework/reject) - a lot can be released exactly once, enforced both here
 * (`released_to_inventory`) and at the DB level (inventory_transactions' unique key on
 * quality_inspection_id), so a duplicate/concurrent request can never post stock twice. */
async function releaseToInventory(inspectionId, req) {
  const inspection = await qualityInspectionRepository.findById(inspectionId);
  if (!inspection) throw ApiError.notFound('Quality inspection not found');
  if (!['APPROVED', 'APPROVED_WITH_DEVIATION', 'PARTIALLY_ACCEPTED'].includes(inspection.status)) {
    throw ApiError.badRequest('Only an Approved, Approved with Deviation, or Partially Accepted inspection can be released to inventory');
  }
  if (inspection.released_to_inventory) throw ApiError.conflict('This inspection has already been released to inventory');

  const qty = Number(inspection.quantity_accepted);
  if (!qty || qty <= 0) throw ApiError.badRequest('There is no accepted quantity to release');

  let transaction;
  await withTransaction(async (connection) => {
    transaction = await inventoryService.postQualityAcceptance(inspection, req, connection);
    await qualityInspectionRepository.markReleased(inspectionId, req.user?.id, connection);
  });

  const updated = await getById(inspectionId);
  await auditService.fromRequest(req, {
    action: 'RELEASE',
    module: 'quality_inspection',
    recordId: inspectionId,
    newValue: { itemCode: inspection.item_code, size: inspection.size, quantityReleased: qty, transactionNo: transaction.transaction_no },
  });
  return { ...updated, inventoryTransaction: transaction };
}

module.exports = {
  listPendingLots,
  getById,
  list,
  startInspection,
  saveParameterResults,
  addDefect,
  removeDefect,
  recordDecision,
  reopenForRework,
  releaseToInventory,
};
