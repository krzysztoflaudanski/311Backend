const Ad = require('../models/ad.model');
const mongoose = require('mongoose');
const path = require('path')
const multer = require('multer');
const fs = require('fs');

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './img/uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        console.log(uniqueSuffix)
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

exports.getAll = async (req, res) => {
    try {
        res.json(await Ad.find({}));
    }
    catch (err) {
        res.status(500).json({ message: err });
    }
};

exports.getById = async (req, res) => {

    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(501).json({ message: 'Invalid UUID' });
    } else {
        const ad = await Ad.findById(req.params.id);
        console.log(ad)
        if (!ad) res.status(404).json({ message: 'Not found' });
        else res.json(ad);
    };
};

exports.post = async (req, res) => {
    try {
        upload.single('image')(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error uploading file' });
            }
            const {
                title,
                content,
                publicationDate,
                price,
                location,
                sellerInfo,
            } = req.body;


            if (!req.file) {
                return res.status(400).json({ message: 'Please upload an image file' });
            }
            const fileRoute = '/img/uploads/' + req.file.filename

            const newAd = new Ad({
                title: title,
                content: content,
                publicationDate: publicationDate,
                image: fileRoute,
                price: price,
                location: location,
                sellerInfo: {
                    username: sellerInfo.username,
                    phone: sellerInfo.phone,
                },
            });

            await newAd.save();
            res.json({ message: 'OK' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
};

exports.put = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(501).json({ message: 'Invalid UUID' });
        }

        // Dodaj upload.single('file') tutaj jako middleware
        upload.single('image')(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error uploading file' });
            }

            const {
                title,
                content,
                publicationDate,
                price,
                location,
                sellerInfo,
            } = req.body;

            const ad = await Ad.findById(req.params.id);

            if (ad) {
                if (ad.image) {
                    const oldFilePath = path.join(__dirname, '..', ad.image);
                    console.log(oldFilePath)
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }

                if (title) ad.title = title;
                if (content) ad.content = content;
                if (publicationDate) ad.publicationDate = publicationDate;
                if (req.file) {
                    const fileRoute = '/img/uploads/' + req.file.filename
                    ad.image = fileRoute;
                }
                if (price) ad.price = price;
                if (location) ad.location = location;
                if (sellerInfo) {
                    ad.sellerInfo.username = sellerInfo.username;
                    ad.sellerInfo.phone = sellerInfo.phone;
                }

                await ad.save();
                res.json(ad);
            } else {
                res.status(404).json({ message: 'Not found...' });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.delete = async (req, res) => {

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(501).json({ message: 'Invalid UUID' });
    } else {
        const deletedAd = await Ad.findById(req.params.id);
        if (deletedAd) {
            const oldFilePath = path.join(__dirname, '..', deletedAd.image);
            console.log(oldFilePath)
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
            await Ad.deleteOne({ _id: req.params.id });
            res.json(deletedAd);
            console.log(deletedAd)
        } else {
            res.status(404).json({ message: 'Not found...' });
        }
    }
};