const Ad = require('../models/ad.model');
const mongoose = require('mongoose');
const path = require('path')
const fs = require('fs');
const User = require('../models/user.model')

exports.getAll = async (req, res) => {
    try {
        res.json(await Ad.find().populate('user'));
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
        const ad = await Ad.findById(req.params.id).populate('user');
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
            price,
            location,
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
            user: req.session.user.id,
        });

        (await newAd.save()).populate('user');
        res.json({ message: 'OK' });

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

        const {
            title,
            content,
            publicationDate,
            price,
            location,
        } = req.body;

        const ad = await Ad.findById(req.params.id);
        
        if (ad && ad.user === req.session.user.id) {
            if (req.file.filename) {
                const oldFilePath = path.join(__dirname, '..', ad.image);
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

            await ad.save();
            res.json(ad);
        } else {
            res.status(404).json({ message: 'Not found...' });
        }
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
        if (deletedAd && deletedAd.user === req.session.user.id) {
            const oldFilePath = path.join(__dirname, '..', deletedAd.image);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
            await Ad.deleteOne({ _id: req.params.id });
            res.json(deletedAd);
        } else {
            res.status(404).json({ message: 'Not found...' });
        }
    }
};

exports.getBySearch = async (req, res) => {
    try {
        const searchPhrase = req.params.searchPhrase 
        const searchResults = await Ad.find({
            $or: [
              { title: { $regex: `\\b${searchPhrase}\\b`, $options: 'i' } },
              { content: { $regex: `\\b${searchPhrase}\\b`, $options: 'i' } },
            ],
          });
          if (searchResults.length > 0) {
          res.json(searchResults);
          } else {
            res.json({ message: 'no search results...'});
          }
    } catch (err) {
        res.status(500).json({ message: err });
    }
}