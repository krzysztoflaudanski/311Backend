const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/authMiddleware');

const auth = require('../controllers/auth.controller');
const uploadImage = require('../utils/uploadImage')

router.post('/register', uploadImage.single('avatar') ,auth.register);
router.post('/login', auth.login);
router.delete('/logout', authMiddleware, auth.logout);
router.get('/user', authMiddleware, auth.getUser)

module.exports = router;