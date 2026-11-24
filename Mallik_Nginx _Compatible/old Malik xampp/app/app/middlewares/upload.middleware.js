const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

/* Allowed MIME Types */
const imageMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/svg+xml"
];

const documentMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

const allMimeTypes = [...imageMimeTypes, ...documentMimeTypes];

/* Ensure Upload Folder Exists */
const createUploadFolder = (folder) => {
    const uploadPath = path.join(process.cwd(), "public", folder);

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    return uploadPath;
};

/* Multer Storage */
const createStorage = (folder = "general") => multer.diskStorage({

    destination: (req, file, cb) => {
        const uploadPath = createUploadFolder(folder);
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

/* File Filter Factory */
const createFileFilter = (allowedTypes) => (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`));
    }
    cb(null, true);
};

/* Upload Factory
 *  @param {string} folder  - subfolder inside public/
 *  @param {string} type    - 'image' | 'document' | 'all'  (default: 'image')
 */
const upload = (folder = "general", type = "image") => {
    const mimeMap = {
        image: imageMimeTypes,
        document: documentMimeTypes,
        all: allMimeTypes
    };
    const allowedTypes = mimeMap[type] || imageMimeTypes;

    return multer({
        storage: createStorage(folder),
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB
        },
        fileFilter: createFileFilter(allowedTypes)
    });
};

module.exports = upload;