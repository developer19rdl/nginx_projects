const fs = require('fs');
const qualityAttachmentRepository = require('../repositories/qualityAttachment.repository');
const ApiError = require('../utils/ApiError');
const auditService = require('./audit.service');

async function listForEntity(entityType, entityId) {
  return qualityAttachmentRepository.findForEntity(entityType, entityId);
}

/** Persists the metadata row for a file multer has already written to disk (see
 * qualityUpload.js) - the physical file itself needs no further handling here. */
async function create({ entityType, entityId, attachmentType, file }, req) {
  const attachment = await qualityAttachmentRepository.create({
    entityType,
    entityId,
    attachmentType,
    fileName: file.originalname,
    filePath: file.path,
    mimeType: file.mimetype,
    fileSizeBytes: file.size,
    uploadedBy: req.user?.id,
  });
  await auditService.fromRequest(req, {
    action: 'UPLOAD',
    module: 'quality_attachment',
    recordId: attachment.id,
    newValue: { entityType, entityId, attachmentType, fileName: file.originalname },
  });
  return attachment;
}

async function getById(id) {
  const attachment = await qualityAttachmentRepository.findById(id);
  if (!attachment) throw ApiError.notFound('Attachment not found');
  return attachment;
}

async function remove(id, req) {
  const attachment = await getById(id);
  await qualityAttachmentRepository.remove(id);
  fs.unlink(attachment.file_path, () => {});
  await auditService.fromRequest(req, {
    action: 'DELETE',
    module: 'quality_attachment',
    recordId: id,
    oldValue: { entityType: attachment.entity_type, entityId: attachment.entity_id, fileName: attachment.file_name },
  });
}

module.exports = { listForEntity, create, getById, remove };
