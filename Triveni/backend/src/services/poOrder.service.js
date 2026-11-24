const poOrderRepository = require('../repositories/poOrder.repository');
const poDetailRepository = require('../repositories/poDetail.repository');
const { parsePagination, buildMeta } = require('../utils/pagination');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

// The Status filter is simplified to Pending/Completed for the UI, mapped onto the real
// underlying production_order.status values. Cancelled orders only surface under "All".
const STATUS_FILTER_GROUPS = {
  Pending: ['Imported', 'Assigning'],
  Completed: ['Assigned'],
};

async function list(query) {
  const { page, pageSize, limit, offset } = parsePagination(query);
  const { rows, total } = await poOrderRepository.findAll({
    search: query.search,
    status: STATUS_FILTER_GROUPS[query.status] || undefined,
    fromDate: query.fromDate,
    toDate: query.toDate,
    limit,
    offset,
    sortBy: query.sortBy,
    sortDir: query.sortDir,
  });
  return { rows, meta: buildMeta({ page, pageSize, total }) };
}

async function getById(id) {
  const order = await poOrderRepository.findById(id);
  if (!order) throw ApiError.notFound('Production order not found');
  const detailRows = await poDetailRepository.findByOrder(id);
  return { ...order, detailRows };
}

/** Deletes an order and (via ON DELETE CASCADE) every machine_planning row under it. Refuses to
 * delete an order that already has real production logged against it (produced_qty > 0 on any
 * row) - that's actual recorded output, not something a delete button should be able to erase. */
async function remove(id, req) {
  const order = await poOrderRepository.findById(id);
  if (!order) throw ApiError.notFound('Production order not found');

  const detailRows = await poDetailRepository.findByOrder(id);
  const hasProduction = detailRows.some((r) => Number(r.produced_qty) > 0);
  if (hasProduction) {
    throw ApiError.conflict('This order already has produced quantity logged against it and cannot be deleted.');
  }

  await poOrderRepository.remove(id);
  await auditService.fromRequest(req, {
    action: 'DELETE',
    module: 'production_order',
    recordId: id,
    oldValue: { ...order, detailRows },
  });
}

module.exports = { list, getById, remove };
