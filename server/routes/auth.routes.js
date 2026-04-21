const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);

module.exports = router;
