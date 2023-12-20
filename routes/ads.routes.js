const express = require('express');
const router = express.Router();

const AdsController = require('../controllers/ads.controller');
const uploadImage = require('../utils/uploadImage')
const authMiddleware = require('../utils/authMiddleware');

router.get('/ads', AdsController.getAll);
router.get('/ads/:id', AdsController.getById);
router.post('/ads', authMiddleware, uploadImage.single('image'), AdsController.post);
router.put('/ads/:id', authMiddleware, uploadImage.single('image'), AdsController.put);
router.delete('/ads/:id', authMiddleware, AdsController.delete);
router.get('/ads/search/:searchPhrase', AdsController.getBySearch);

module.exports = router;