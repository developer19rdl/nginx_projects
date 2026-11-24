const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const uploadDir = path.resolve(process.cwd(), env.upload.dir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls (still accepted for upload, converted on read)
]);
const ALLOWED_EXTENSIONS = new Set(['.xlsx', '.xls']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(ApiError.badRequest('Only .xlsx or .xls Excel files are allowed'));
  }
  cb(null, true);
}

const excelUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxSizeMb * 1024 * 1024, files: 1 },
});

module.exports = { excelUpload, uploadDir };
