const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

// A second, independent multer instance from fileUpload.js's excelUpload - that one is
// hard-locked to .xlsx/.xls. Quality attachments are photos and documents (defect photos, test
// certificates, measurement reports, calibration certificates), so this one accepts images and
// PDFs instead, writing into its own subdirectory under the shared upload root.
const qualityUploadDir = path.resolve(process.cwd(), env.upload.dir, 'quality');
if (!fs.existsSync(qualityUploadDir)) fs.mkdirSync(qualityUploadDir, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, qualityUploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPEG/PNG/WEBP images or PDF files are allowed'));
  }
  cb(null, true);
}

const qualityUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxSizeMb * 1024 * 1024, files: 1 },
});

module.exports = { qualityUpload, qualityUploadDir };
