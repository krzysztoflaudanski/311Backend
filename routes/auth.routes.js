const express = require('express');
const router = express.Router();

const auth = require('../controllers/auth.controller');
const uploadImage = require('../utils/uploadImage')

router.post('/register', uploadImage.single('avatar') ,auth.register);
//router.post('/login', auth.login);

module.exports = router;