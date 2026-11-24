const fs = require('fs');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const service = require('../services/qualityAttachment.service');

const listForEntity = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.query;
  if (!entityType || !entityId) throw ApiError.badRequest('entityType and entityId are required');
  const attachments = await service.listForEntity(entityType, Number(entityId));
  success(res, { message: 'OK', data: attachments });
});

const upload = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file was uploaded');
  const { entityType, entityId, attachmentType } = req.body;
  if (!entityType || !entityId || !attachmentType) throw ApiError.badRequest('entityType, entityId and attachmentType are required');
  const attachment = await service.create({ entityType, entityId: Number(entityId), attachmentType, file: req.file }, req);
  success(res, { message: 'Attachment uploaded', data: attachment, statusCode: 201 });
});

/** Streams the stored file back - the first file-serving route in this repo (see
 * qualityUpload.js's comment); gated behind the same auth+permission chain as every other
 * route, so an attachment can't be fetched by URL guessing without a valid session. */
const getFile = asyncHandler(async (req, res) => {
  const attachment = await service.getById(Number(req.params.id));
  if (!fs.existsSync(attachment.file_path)) throw ApiError.notFound('The stored file is missing');
  res.setHeader('Content-Type', attachment.mime_type);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(attachment.file_name)}"`);
  fs.createReadStream(attachment.file_path).pipe(res);
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(Number(req.params.id), req);
  success(res, { message: 'Attachment deleted', data: null });
});

module.exports = { listForEntity, upload, getFile, remove };
