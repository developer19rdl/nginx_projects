const { connection, CustomError } = require('../config/dbSql2');
const excel = require('exceljs');
const moment = require('moment-timezone');

const utility = require('../utility/utilityFunction');

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

// ── Company video upload (multer — the logo above uses base64-in-JSON, but a
//    video is far too large for that; same disk-storage pattern as the SCADA
//    background-image upload in ScadaController.js). ──────────────────────────
const VIDEO_UPLOAD_DIR = path.join(process.cwd(), 'public', 'videos');
fs.mkdirSync(VIDEO_UPLOAD_DIR, { recursive: true });

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, VIDEO_UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uuidv4()}${ext}`);
    },
});

const videoFileFilter = (req, file, cb) => {
    const allowed = /\.(mp4|webm|ogg|mov|m4v)$/i;
    allowed.test(path.extname(file.originalname))
        ? cb(null, true)
        : cb(new Error('Only video files are allowed (mp4, webm, ogg, mov, m4v)'));
};

exports.videoUpload = multer({
    storage: videoStorage,
    fileFilter: videoFileFilter,
    limits: { fileSize: 150 * 1024 * 1024 }, // 150 MB
});

// `logos` holds one logical "current company settings" row, read back via
// `ORDER BY id DESC LIMIT 1` — but logo and video are uploaded independently,
// so a blind INSERT per upload (the logo endpoint's original behavior) would
// make the two clobber each other: uploading a video after a logo would
// leave the newest row's customerLogo NULL (video upload doesn't know the
// logo), silently "losing" the logo from what companyDetails returns, and
// vice versa. Updating the existing latest row (only the columns this
// upload actually owns) instead keeps both independently persistent.
async function upsertLogoRow(fields) {
    const [existing] = await connection.execute('SELECT id FROM logos ORDER BY id DESC LIMIT 1');
    const cols = Object.keys(fields);
    if (existing.length) {
        const setClause = cols.map((c) => `${c} = ?`).join(', ');
        await connection.execute(
            `UPDATE logos SET ${setClause} WHERE id = ?`,
            [...cols.map((c) => fields[c]), existing[0].id]
        );
        return existing[0].id;
    }
    const placeholders = cols.map(() => '?').join(', ');
    const [result] = await connection.execute(
        `INSERT INTO logos (${cols.join(', ')}) VALUES (${placeholders})`,
        cols.map((c) => fields[c])
    );
    return result.insertId;
}

// POST /api/companyDetails/VideoUpload  (multipart/form-data, field: "video")
exports.VideoUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No video file provided' });
        }
        const videoPath = `videos/${req.file.filename}`;
        await upsertLogoRow({ companyVideo: videoPath });
        return res.status(200).json({ success: true, message: 'Video uploaded successfully', videoPath });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.LogoUpload = async (req, res) => {
    try {
        const cmpDetails = req.body;
        const customerLogoPath = utility.storeFile(cmpDetails.customerLogo, 'logo');

        await upsertLogoRow({
            customerLogo: customerLogoPath,
            companyName: cmpDetails.companyName,
            customerTheme: cmpDetails.customerTheme,
        });
        return res.status(200).json({ success: true, message: "Logo Upload successfully" });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


exports.companyDetails = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            `SELECT * FROM logos 
             ORDER BY id DESC 
             LIMIT 1`
        );

        if (rows.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Company Details",
                data: rows[0]
            });
        } else {
            throw new Error("Company Details not found");
        }
    } catch (err) {
        return res.status(406).json({
            success: false,
            message: err.message || 'An error occurred'
        });
    }
};


