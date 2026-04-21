const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { getSuggestions } = require('../controllers/ai.controller');

router.post('/suggestions', auth, getSuggestions);

module.exports = router;
