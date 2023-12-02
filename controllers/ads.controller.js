const Ad = require('../models/ad.model');
const mongoose = require('mongoose');
const multer = require('multer');

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './img/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
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
        const {
            title,
            content,
            publicationDate,
            image,
            price,
            location,
            sellerInfo
        } = req.body;
        if (title, content, publicationDate, image, price, location) {
            const newAd = new Ad({
                title: title,
                content: content,
                publicationDate: publicationDate,
                image: image,
                price: price,
                location: location,
                sellerInfo: {
                    username: sellerInfo.username,
                    phone: sellerInfo.phone
                },
            });
            await newAd.save();
            res.json({ message: 'OK' });
        } else {
            res.status(404).json({ message: 'Not found...' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
};

exports.put = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(501).json({ message: 'Invalid UUID' });
    } else {
        const {
            title,
            content,
            publicationDate,
            image,
            price,
            location,
            //sellerInfo: {username, phone} //x-www-from-urlencoded
            sellerInfo
        } = req.body;
        const ad = await Ad.findById(req.params.id);
        if (ad) {
            if (title) ad.title = title;
            if (content) ad.content = content;
            if (publicationDate) ad.publicationDate = publicationDate;
            if (image) ad.image = image;
            if (price) ad.price = price;
            if (location) ad.location = location;
            if (sellerInfo) ad.sellerInfo.username = sellerInfo.username;
            if (sellerInfo) ad.sellerInfo.phone = sellerInfo.phone;
            await ad.save();
            res.json(ad);
        } else {
            res.status(404).json({ message: 'Not found...' });
        }
    }
};

exports.delete = async (req, res) => {

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(501).json({ message: 'Invalid UUID' });
    } else {
        const deletedAd = await Ad.findById(req.params.id);
        if (deletedAd) {
            await Ad.deleteOne({ _id: req.params.id });
            res.json(deletedAd);
            console.log(deletedAd)
        } else {
            res.status(404).json({ message: 'Not found...' });
        }
    }
};