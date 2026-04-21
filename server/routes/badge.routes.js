const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { getBadges } = require('../controllers/badge.controller');

router.get('/', auth, getBadges);

module.exports = router;
