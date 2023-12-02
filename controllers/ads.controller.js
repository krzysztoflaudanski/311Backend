const Ad = require('../models/ad.model');
const mongoose = require('mongoose');

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
    console.log(req.params)
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
            'sellerInfo[username]': sellerUsername,
            'sellerInfo[phone]': sellerPhone,
        } = req.body;
        const newAd = new Ad({
            title: title,
            content: content,
            publicationDate: publicationDate,
            image: image,
            price: price,
            location: location,
            sellerInfo: {
                username: sellerUsername,
                phone: sellerPhone
            },
        });
        console.log(req.body)
        await newAd.save();
        res.json({ message: 'OK' });
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
            'sellerInfo[username]': sellerUsername,
            'sellerInfo[phone]': sellerPhone,
        } = req.body;
        console.log(req.body)
        //console.log(sellerInfo)
        const ad = await Ad.findById(req.params.id);
        if (ad) {
            if (title) ad.title = title;
            if (content) ad.content = content;
            if (publicationDate) ad.publicationDate = publicationDate;
            if (image) ad.image = image;
            if (price) ad.price = price;
            if (location) ad.location = location;
            if (sellerUsername) ad.sellerInfo.username = sellerUsername;
            if (sellerPhone) ad.sellerInfo.phone = sellerPhone;
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