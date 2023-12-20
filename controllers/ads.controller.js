const Ad = require('../models/ad.model');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const sanitize = require('mongo-sanitize');
const getImageFileType = require('../utils/getImageFileType')

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

        if (!ad) res.status(404).json({ message: 'Not found' });
        else res.json(ad);
    };
};

exports.post = async (req, res) => {
    try {

        const cleanBody = sanitize(req.body);
        const {
            title,
            content,
            price,
            location,
        } = cleanBody

        if (title && typeof title === 'string' && content && typeof content === 'string' && price && typeof parseInt(price) === 'number' &&
            location && typeof location === 'string' && req.session.user.id) {

            const fileType = req.file ? await getImageFileType(req.file) : 'unknown';

            if (!req.file || !['image/png', 'image/jpeg', 'image/gif'].includes(fileType)) {
                if (req.file) {
                    const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
                    fs.unlinkSync(fileRoute)
                }
                return res.status(400).json({ message: 'Please upload an image file' });
            }


            const fileRoute = '/img/uploads/' + req.file.filename
            const currentDate = new Date();

            const pattern = new RegExp(/([A-z\d\s.,!?$-*:]*)/, 'g');
            const titleMatched = title.match(pattern).join('');
            const contentMatched = content.match(pattern).join('');

            const locationPattern = new RegExp(/([A-z\s-]*)/, 'g');
            const locationMatched = location.match(locationPattern).join('');

            if (titleMatched.length < title.length || contentMatched.length < content.length || locationMatched.length < location.length) {
                if (req.file) {
                    const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
                    fs.unlinkSync(fileRoute)
                }
                return res.status(400).json({ message: 'Invalid characters' });
            }

            const newAd = new Ad({
                title: title,
                content: content,
                publicationDate: currentDate,
                image: fileRoute,
                price: price,
                location: location,
                user: req.session.user.id,
            });

            await newAd.save();

            const adWithUser = await Ad.findById(newAd._id).populate('user');

            res.json({ message: 'OK', ad: adWithUser });
        } else {
            if (req.file) {
                const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
                fs.unlinkSync(fileRoute)
            }
            res.status(400).send({ message: 'Bad request' })
        }

    } catch (err) {
        if (req.file) {
            const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
            fs.unlinkSync(fileRoute)
        }
        console.error(err);
        res.status(500).json({ message: err });
    }
};

exports.put = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {

            if (req.file) {
                const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
                fs.unlinkSync(fileRoute)
            }

            return res.status(501).json({ message: 'Invalid UUID' });
        }

        const cleanBody = sanitize(req.body)
        const {
            title,
            content,
            price,
            location,
        } = cleanBody;

        const ad = await Ad.findById(req.params.id);

        if (ad && ad.user === req.session.user.id) {

            const pattern = new RegExp(/([A-z\d\s.,!?$-*:]*)/, 'g');
            const locationPattern = new RegExp(/([A-z\s-]*)/, 'g');

            if (title) {
                const titleMatched = title.match(pattern).join('');
                if (titleMatched.length < title.length) {
                    if (req.file) {
                        const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
                        fs.unlinkSync(fileRoute)
                    }
                    return res.status(400).json({ message: 'Invalid characters' });
                }
                ad.title = title
            };
            if (content) {
                const contentMatched = content.match(pattern).join('');
                if (contentMatched.length < content.length) {
                    if (req.file) {
                        const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
                        fs.unlinkSync(fileRoute)
                    }
                    return res.status(400).json({ message: 'Invalid characters' });
                }
                ad.content = content;
            };
            if (price) ad.price = price;
            if (location) {
                const locationMatched = location.match(locationPattern).join('');
                if (locationMatched.length < location.length) {
                    if (req.file) {
                        const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
                        fs.unlinkSync(fileRoute)
                    }
                    return res.status(400).json({ message: 'Invalid characters' });
                }
                ad.location = location
            };

            const fileType = req.file ? await getImageFileType(req.file) : 'unknown';

            if (req.file && req.file.filename) {
                const oldFilePath = path.join(__dirname, '..', ad.image);
                if (!['image/png', 'image/jpeg', 'image/gif'].includes(fileType)) {

                    const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
                    fs.unlinkSync(fileRoute)

                    return res.status(400).json({ message: 'Please upload an image file' });
                }
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            if (req.file) {
                const fileRoute = '/img/uploads/' + req.file.filename
                ad.image = fileRoute;
            }

            await ad.save();
            res.json(ad);
        } else {
            if (req.file) {
                const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
                fs.unlinkSync(fileRoute)
            }
            res.status(404).json({ message: 'Not found...' });
        }
    } catch (err) {
        if (req.file) {
            const fileRoute = path.join(__dirname, '../img/uploads/', req.file.filename)
            fs.unlinkSync(fileRoute)
        }
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
            res.json({ message: 'no search results...' });
        }
    } catch (err) {
        res.status(500).json({ message: err });
    }
}