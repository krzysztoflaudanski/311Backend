const express = require('express');
const router = express.Router();

const AdsController = require('../controllers/ads.controller');
const uploadImage = require('../utils/uploadImage')

router.get('/ads', AdsController.getAll);
router.get('/ads/:id', AdsController.getById);
router.post('/ads', uploadImage.single('image'), AdsController.post);
router.put('/ads/:id', uploadImage.single('image'), AdsController.put);
router.delete('/ads/:id', AdsController.delete);
// router.get('/ads/random', AdsController.getBySearch);

module.exports = router;