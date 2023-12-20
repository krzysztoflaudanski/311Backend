const multer = require('multer');

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './img/uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newFileName = uniqueSuffix + file.originalname
        cb(null, newFileName);
    },
});

const upload = multer({
    storage: fileStorageEngine,
    limits: {
        fileSize: 1024 * 1024 * 1, // 1 MB
    },
});

module.exports = upload;