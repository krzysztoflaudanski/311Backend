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
    fileFilter: (req, file, cb) => {
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/gif') {
            cb(null, true);
        } else {
            req.fileError = 'Only .png, .jpg, .jpeg, or .gif files are allowed.';
            cb(null, false);
        }
    }
});

module.exports = upload;