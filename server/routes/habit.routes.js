const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { getHabits, createHabit, updateHabit, deleteHabit } = require('../controllers/habit.controller');

router.get('/', auth, getHabits);
router.post('/', auth, createHabit);
router.put('/:id', auth, updateHabit);
router.delete('/:id', auth, deleteHabit);

module.exports = router;
