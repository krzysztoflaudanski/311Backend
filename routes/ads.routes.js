const express = require('express');
const router = express.Router();

const AdsController = require('../controllers/ads.controller');

router.get('/ads', AdsController.getAll);
router.get('/ads/:id', AdsController.getById);
router.post('/ads', AdsController.post);
router.put('/ads/:id', AdsController.put);
router.delete('/ads/:id', AdsController.delete);
// router.get('/ads/random', AdsController.getBySearch);

module.exports = router;