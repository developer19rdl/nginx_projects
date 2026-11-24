const { withTransaction } = require('../config/database');
const warehouseRepository = require('../repositories/warehouse.repository');
const finishedGoodsInventoryRepository = require('../repositories/finishedGoodsInventory.repository');
const inventoryTransactionRepository = require('../repositories/inventoryTransaction.repository');
const stockTransferRepository = require('../repositories/stockTransfer.repository');
const stockAdjustmentRepository = require('../repositories/stockAdjustment.repository');
const stockHoldRepository = require('../repositories/stockHold.repository');
const qualityInspectionRepository = require('../repositories/qualityInspection.repository');
const { generateNo } = require('../utils/inventoryNoGenerator');
const { parsePagination, buildMeta } = require('../utils/pagination');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

/**
 * Posts a Quality Report's accepted quantity into Finished Goods stock - the one and only writer
 * of QUALITY_ACCEPTANCE transactions. MUST be called from within qualityInspection.service.js's
 * releaseToInventory, on the same `connection` and inside the same transaction, so a failure here
 * rolls back the inspection's released_to_inventory flip too (rule: "if inventory update fails,
 * the Quality transaction should also rollback"). Idempotency is enforced two ways: the caller
 * already checks `released_to_inventory` before calling this, and
 * `inventory_transactions.uq_it_quality_inspection` is a DB-level backstop against a concurrent
 * duplicate call ever posting the same report's stock twice.
 */
async function postQualityAcceptance(inspection, req, connection) {
  const location = await warehouseRepository.findDefaultLocation(connection);
  if (!location) throw ApiError.internal('No active warehouse location is configured for Finished Goods receipts');

  const lot = await qualityInspectionRepository.findMachinePlanningRow(inspection.machine_planning_id, connection);
  const quantity = Number(inspection.quantity_accepted);

  const transactionNo = await generateNo(connection, 'INV');
  const transactionId = await inventoryTransactionRepository.insert(
    {
      transactionNo,
      transactionType: 'QUALITY_ACCEPTANCE',
      itemCode: inspection.item_code,
      size: inspection.size,
      lotNo: inspection.lot_no,
      quantity,
      warehouseId: location.warehouse_id,
      locationId: location.id,
      productionOrderId: lot?.order_id ?? null,
      qualityInspectionId: inspection.id,
      machineId: inspection.machine_id,
      referenceType: 'QUALITY_INSPECTION',
      referenceId: inspection.id,
      remarks: `Quality acceptance for inspection ${inspection.inspection_no}`,
      createdBy: req.user?.id,
    },
    connection
  );

  await finishedGoodsInventoryRepository.increaseAvailable(
    {
      itemCode: inspection.item_code,
      size: inspection.size,
      lotNo: inspection.lot_no,
      warehouseId: location.warehouse_id,
      locationId: location.id,
      quantity,
    },
    connection
  );

  return inventoryTransactionRepository.findById(transactionId, connection);
}

/** Reduces available stock when finished goods physically leave the warehouse. No dedicated
 * dispatch-order table (matches this module's own suggested schema, which doesn't have one) -
 * just a DISPATCH transaction with a free-text reference. */
async function dispatch(data, req) {
  const quantity = Number(data.quantity);
  if (!(quantity > 0)) throw ApiError.badRequest('Quantity must be greater than zero');

  const location = await resolveLocation(data.warehouseId, data.locationId);

  const result = await withTransaction(async (connection) => {
    await finishedGoodsInventoryRepository.decreaseAvailable(
      { itemCode: data.itemCode, size: data.size, lotNo: data.lotNo, warehouseId: location.warehouse_id, locationId: location.id, quantity },
      connection
    );
    const transactionNo = await generateNo(connection, 'INV');
    const id = await inventoryTransactionRepository.insert(
      {
        transactionNo,
        transactionType: 'DISPATCH',
        itemCode: data.itemCode,
        size: data.size,
        lotNo: data.lotNo,
        quantity,
        warehouseId: location.warehouse_id,
        locationId: location.id,
        remarks: data.referenceNo ? `${data.remarks || 'Dispatch'} (Ref: ${data.referenceNo})` : data.remarks,
        createdBy: req.user?.id,
      },
      connection
    );
    return inventoryTransactionRepository.findById(id, connection);
  });

  await auditService.fromRequest(req, { action: 'DISPATCH', module: 'inventory_transaction', recordId: result.id, newValue: result });
  return result;
}

/** Moves stock between warehouse/location - posts a TRANSFER_OUT at the source and a
 * TRANSFER_IN at the destination, both linked back to one stock_transfers row. */
async function transfer(data, req) {
  const quantity = Number(data.quantity);
  if (!(quantity > 0)) throw ApiError.badRequest('Quantity must be greater than zero');
  if (Number(data.fromLocationId) === Number(data.toLocationId)) {
    throw ApiError.badRequest('Source and destination location must be different');
  }

  const result = await withTransaction(async (connection) => {
    await finishedGoodsInventoryRepository.decreaseAvailable(
      { itemCode: data.itemCode, size: data.size, lotNo: data.lotNo, warehouseId: data.fromWarehouseId, locationId: data.fromLocationId, quantity },
      connection
    );
    await finishedGoodsInventoryRepository.increaseAvailable(
      { itemCode: data.itemCode, size: data.size, lotNo: data.lotNo, warehouseId: data.toWarehouseId, locationId: data.toLocationId, quantity },
      connection
    );

    const transferNo = await generateNo(connection, 'TRF');
    const transferId = await stockTransferRepository.create(
      {
        transferNo,
        itemCode: data.itemCode,
        size: data.size,
        lotNo: data.lotNo,
        quantity,
        fromWarehouseId: data.fromWarehouseId,
        fromLocationId: data.fromLocationId,
        toWarehouseId: data.toWarehouseId,
        toLocationId: data.toLocationId,
        remarks: data.remarks,
        createdBy: req.user?.id,
      },
      connection
    );

    const outNo = await generateNo(connection, 'INV');
    await inventoryTransactionRepository.insert(
      {
        transactionNo: outNo,
        transactionType: 'TRANSFER_OUT',
        itemCode: data.itemCode,
        size: data.size,
        lotNo: data.lotNo,
        quantity,
        warehouseId: data.fromWarehouseId,
        locationId: data.fromLocationId,
        referenceType: 'STOCK_TRANSFER',
        referenceId: transferId,
        remarks: data.remarks,
        createdBy: req.user?.id,
      },
      connection
    );
    const inNo = await generateNo(connection, 'INV');
    await inventoryTransactionRepository.insert(
      {
        transactionNo: inNo,
        transactionType: 'TRANSFER_IN',
        itemCode: data.itemCode,
        size: data.size,
        lotNo: data.lotNo,
        quantity,
        warehouseId: data.toWarehouseId,
        locationId: data.toLocationId,
        referenceType: 'STOCK_TRANSFER',
        referenceId: transferId,
        remarks: data.remarks,
        createdBy: req.user?.id,
      },
      connection
    );

    return stockTransferRepository.findById(transferId, connection);
  });

  await auditService.fromRequest(req, { action: 'TRANSFER', module: 'stock_transfer', recordId: result.id, newValue: result });
  return result;
}

/** Corrects a balance with a mandatory reason - the only sanctioned way to change stock outside
 * of Quality Acceptance/Dispatch/Transfer/Hold, per rule #11 (a correction must be its own
 * auditable adjustment, never a silent edit). */
async function adjust(data, req) {
  const quantity = Number(data.quantity);
  if (!(quantity > 0)) throw ApiError.badRequest('Quantity must be greater than zero');
  if (!data.reason) throw ApiError.badRequest('A reason is required for a stock adjustment');

  const result = await withTransaction(async (connection) => {
    if (data.direction === 'OUT') {
      await finishedGoodsInventoryRepository.decreaseAvailable(
        { itemCode: data.itemCode, size: data.size, lotNo: data.lotNo, warehouseId: data.warehouseId, locationId: data.locationId, quantity },
        connection
      );
    } else {
      await finishedGoodsInventoryRepository.increaseAvailable(
        { itemCode: data.itemCode, size: data.size, lotNo: data.lotNo, warehouseId: data.warehouseId, locationId: data.locationId, quantity },
        connection
      );
    }

    const adjustmentNo = await generateNo(connection, 'ADJ');
    const adjustmentId = await stockAdjustmentRepository.create(
      {
        adjustmentNo,
        itemCode: data.itemCode,
        size: data.size,
        lotNo: data.lotNo,
        warehouseId: data.warehouseId,
        locationId: data.locationId,
        quantity,
        direction: data.direction,
        reason: data.reason,
        createdBy: req.user?.id,
      },
      connection
    );

    const transactionNo = await generateNo(connection, 'INV');
    await inventoryTransactionRepository.insert(
      {
        transactionNo,
        transactionType: data.direction === 'OUT' ? 'ADJUSTMENT_OUT' : 'ADJUSTMENT_IN',
        itemCode: data.itemCode,
        size: data.size,
        lotNo: data.lotNo,
        quantity,
        warehouseId: data.warehouseId,
        locationId: data.locationId,
        referenceType: 'STOCK_ADJUSTMENT',
        referenceId: adjustmentId,
        remarks: data.reason,
        createdBy: req.user?.id,
      },
      connection
    );

    return stockAdjustmentRepository.findById(adjustmentId, connection);
  });

  await auditService.fromRequest(req, { action: 'ADJUST', module: 'stock_adjustment', recordId: result.id, newValue: result });
  return result;
}

/** Moves quantity from available to hold - total on-hand is unchanged, so this doesn't need a
 * negative-stock check beyond "enough available to hold" (finishedGoodsInventory.moveToHold
 * already enforces that). */
async function hold(data, req) {
  const quantity = Number(data.quantity);
  if (!(quantity > 0)) throw ApiError.badRequest('Quantity must be greater than zero');
  if (!data.reason) throw ApiError.badRequest('A reason is required to place stock on hold');

  const result = await withTransaction(async (connection) => {
    await finishedGoodsInventoryRepository.moveToHold(
      { itemCode: data.itemCode, size: data.size, lotNo: data.lotNo, warehouseId: data.warehouseId, locationId: data.locationId, quantity },
      connection
    );

    const holdNo = await generateNo(connection, 'HLD');
    const holdId = await stockHoldRepository.create(
      {
        holdNo,
        itemCode: data.itemCode,
        size: data.size,
        lotNo: data.lotNo,
        warehouseId: data.warehouseId,
        locationId: data.locationId,
        quantity,
        reason: data.reason,
        heldBy: req.user?.id,
      },
      connection
    );

    const transactionNo = await generateNo(connection, 'INV');
    await inventoryTransactionRepository.insert(
      {
        transactionNo,
        transactionType: 'HOLD',
        itemCode: data.itemCode,
        size: data.size,
        lotNo: data.lotNo,
        quantity,
        warehouseId: data.warehouseId,
        locationId: data.locationId,
        referenceType: 'STOCK_HOLD',
        referenceId: holdId,
        remarks: data.reason,
        createdBy: req.user?.id,
      },
      connection
    );

    return stockHoldRepository.findById(holdId, connection);
  });

  await auditService.fromRequest(req, { action: 'HOLD', module: 'stock_hold', recordId: result.id, newValue: result });
  return result;
}

/** Releases a previously held quantity back to available. */
async function releaseHold(holdId, data, req) {
  const result = await withTransaction(async (connection) => {
    const [rows] = await connection.query(`SELECT * FROM stock_holds WHERE id = :id FOR UPDATE`, { id: holdId });
    const holdRow = rows[0];
    if (!holdRow) throw ApiError.notFound('Stock hold not found');
    if (holdRow.status !== 'ON_HOLD') throw ApiError.conflict('This hold has already been released');

    await finishedGoodsInventoryRepository.releaseFromHold(
      {
        itemCode: holdRow.item_code,
        size: holdRow.size,
        lotNo: holdRow.lot_no,
        warehouseId: holdRow.warehouse_id,
        locationId: holdRow.location_id,
        quantity: Number(holdRow.quantity),
      },
      connection
    );
    await stockHoldRepository.markReleased(holdId, { releasedBy: req.user?.id, releaseRemarks: data?.remarks }, connection);

    const transactionNo = await generateNo(connection, 'INV');
    await inventoryTransactionRepository.insert(
      {
        transactionNo,
        transactionType: 'RELEASE',
        itemCode: holdRow.item_code,
        size: holdRow.size,
        lotNo: holdRow.lot_no,
        quantity: holdRow.quantity,
        warehouseId: holdRow.warehouse_id,
        locationId: holdRow.location_id,
        referenceType: 'STOCK_HOLD',
        referenceId: holdId,
        remarks: data?.remarks,
        createdBy: req.user?.id,
      },
      connection
    );

    return stockHoldRepository.findById(holdId, connection);
  });

  await auditService.fromRequest(req, { action: 'RELEASE_HOLD', module: 'stock_hold', recordId: result.id, newValue: result });
  return result;
}

async function resolveLocation(warehouseId, locationId) {
  if (locationId) {
    const location = await warehouseRepository.findLocationById(locationId);
    if (!location) throw ApiError.badRequest('Invalid warehouse location');
    if (warehouseId && Number(location.warehouse_id) !== Number(warehouseId)) {
      throw ApiError.badRequest('That location does not belong to the given warehouse');
    }
    return location;
  }
  const location = await warehouseRepository.findDefaultLocation();
  if (!location) throw ApiError.internal('No active warehouse location is configured');
  return location;
}

async function listHolds(status) {
  return stockHoldRepository.findAll({ status });
}

async function getInventorySummary(itemCode) {
  return finishedGoodsInventoryRepository.getSummary({ itemCode });
}

async function getBatchStock(query) {
  return finishedGoodsInventoryRepository.getBatchStock(query);
}

async function getLedger(query) {
  return inventoryTransactionRepository.getLedger(query);
}

async function listTransactions(query) {
  const { page, pageSize } = parsePagination(query);
  const { rows, total } = await inventoryTransactionRepository.findAll({
    itemCode: query.itemCode,
    transactionType: query.transactionType,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    page,
    pageSize,
  });
  return { rows, meta: buildMeta({ page, pageSize, total }) };
}

async function getTransactionById(id) {
  const transaction = await inventoryTransactionRepository.findById(id);
  if (!transaction) throw ApiError.notFound('Inventory transaction not found');
  return transaction;
}

async function getTransactionByInspectionId(inspectionId) {
  return inventoryTransactionRepository.findByQualityInspectionId(inspectionId);
}

module.exports = {
  postQualityAcceptance,
  dispatch,
  transfer,
  adjust,
  hold,
  releaseHold,
  listHolds,
  getInventorySummary,
  getBatchStock,
  getLedger,
  listTransactions,
  getTransactionById,
  getTransactionByInspectionId,
};
