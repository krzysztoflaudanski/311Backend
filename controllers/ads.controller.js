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