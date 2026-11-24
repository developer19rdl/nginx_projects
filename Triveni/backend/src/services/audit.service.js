const auditLogRepository = require('../repositories/auditLog.repository');
const logger = require('../utils/logger');

/**
 * Fire-and-forget audit logging - failures here must never break the calling
 * business operation, so errors are logged and swallowed.
 */
async function record(entry, connection) {
  try {
    await auditLogRepository.create(entry, connection);
  } catch (err) {
    logger.error('Failed to write audit log', { error: err.message, entry });
  }
}

function fromRequest(req, { action, module, recordId, oldValue, newValue, remarks }, connection) {
  return record(
    {
      userId: req.user?.id,
      action,
      module,
      recordId,
      oldValue,
      newValue,
      remarks,
      ipAddress: req.ip,
    },
    connection
  );
}

async function list(filters) {
  return auditLogRepository.findAll(filters);
}

module.exports = { record, fromRequest, list };
