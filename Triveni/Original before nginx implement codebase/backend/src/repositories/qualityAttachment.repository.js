const { pool } = require('../config/database');

async function findById(id) {
  const [rows] = await pool.query(`SELECT * FROM quality_attachments WHERE id = :id`, { id });
  return rows[0] || null;
}

async function findForEntity(entityType, entityId) {
  const [rows] = await pool.query(
    `SELECT * FROM quality_attachments WHERE entity_type = :entityType AND entity_id = :entityId ORDER BY id`,
    { entityType, entityId }
  );
  return rows;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO quality_attachments (entity_type, entity_id, attachment_type, file_name, file_path, mime_type, file_size_bytes, uploaded_by)
     VALUES (:entityType, :entityId, :attachmentType, :fileName, :filePath, :mimeType, :fileSizeBytes, :uploadedBy)`,
    {
      entityType: data.entityType,
      entityId: data.entityId,
      attachmentType: data.attachmentType,
      fileName: data.fileName,
      filePath: data.filePath,
      mimeType: data.mimeType,
      fileSizeBytes: data.fileSizeBytes,
      uploadedBy: data.uploadedBy ?? null,
    }
  );
  return findById(result.insertId);
}

async function remove(id) {
  await pool.query(`DELETE FROM quality_attachments WHERE id = :id`, { id });
}

module.exports = { findById, findForEntity, create, remove };
