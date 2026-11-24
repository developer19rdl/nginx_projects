const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/ApiResponse');
const { authenticate } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const { PERMISSIONS } = require('../../config/constants');
const auditService = require('../../services/audit.service');
const { parsePagination, buildMeta } = require('../../utils/pagination');

router.use(authenticate, requirePermission(PERMISSIONS.AUDIT_VIEW));

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, pageSize, limit, offset } = parsePagination(req.query);
    const { rows, total } = await auditService.list({
      module: req.query.module,
      userId: req.query.userId ? Number(req.query.userId) : undefined,
      from: req.query.from,
      to: req.query.to,
      limit,
      offset,
    });
    success(res, { message: 'OK', data: rows, meta: buildMeta({ page, pageSize, total }) });
  })
);

module.exports = router;
