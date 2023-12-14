const express = require('express');
const router = express.Router();
const authMiddelware = require('../utils/authMiddelware');

const auth = require('../controllers/auth.controller');
const uploadImage = require('../utils/uploadImage')

router.post('/register', uploadImage.single('avatar') ,auth.register);
router.post('/login', uploadImage.single('avatar'), auth.login);
router.get('/user', authMiddelware, auth.getUser)

module.exports = router;