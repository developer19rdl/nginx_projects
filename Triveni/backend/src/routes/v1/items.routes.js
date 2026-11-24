const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/ApiResponse');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const { PERMISSIONS } = require('../../config/constants');
const { parsePagination, buildMeta } = require('../../utils/pagination');
const itemRepository = require('../../repositories/item.repository');
const auditService = require('../../services/audit.service');

router.use(authenticate);

router.get(
  '/',
  requirePermission(PERMISSIONS.PRODUCTION_PLAN_VIEW, PERMISSIONS.MACHINE_VIEW),
  asyncHandler(async (req, res) => {
    const { page, pageSize, limit, offset } = parsePagination(req.query);
    const { rows, total } = await itemRepository.findAll({ search: req.query.search, limit, offset });
    success(res, { message: 'OK', data: rows, meta: buildMeta({ page, pageSize, total }) });
  })
);

router.post(
  '/',
  requirePermission(PERMISSIONS.MACHINE_MANAGE),
  asyncHandler(async (req, res) => {
    const item = await itemRepository.upsert(req.body);
    await auditService.fromRequest(req, { action: 'UPSERT', module: 'item', recordId: item.item_code, newValue: item });
    success(res, { message: 'Item saved', data: item, statusCode: 201 });
  })
);

module.exports = router;
