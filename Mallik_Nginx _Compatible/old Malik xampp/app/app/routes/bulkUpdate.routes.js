const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bulkUpdateController = require('../controllers/bulkUpdate.controller');
const excelBulkLoadController = require('../controllers/excelBulkLoad.controller');

// Disk storage (not memory): a 400k-row bulk-update workbook can be tens of MB — buffering the
// whole file in memory before parsing even starts risks OOM on top of ExcelJS's own memory use.
// Written to uploads/ (not public/, which server.js serves statically) since these are transient,
// potentially sensitive uploads, not public assets. excelBulkLoadController deletes each file
// after processing.
const uploadDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
    }),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB — generous for a large bulk-update sheet, still bounded
});

router.get('/list', bulkUpdateController.listMasters);
router.get('/getMasterFields', bulkUpdateController.getMasterFields);
router.get('/getMasterData', bulkUpdateController.getMasterData);
router.get('/exportMasterData', bulkUpdateController.exportMasterData);
router.post('/master', bulkUpdateController.bulkUpdateMaster);
router.post('/load', upload.single('file'), excelBulkLoadController.loadExcel);

module.exports = router;
