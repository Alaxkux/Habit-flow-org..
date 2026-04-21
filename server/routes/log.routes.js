const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { checkIn, getLogs, getStreak, getTodayStatus } = require('../controllers/log.controller');

router.post('/checkin', auth, checkIn);
router.get('/', auth, getLogs);
router.get('/today', auth, getTodayStatus);
router.get('/streak/:habitId', auth, getStreak);

module.exports = router;
