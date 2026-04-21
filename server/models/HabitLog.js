const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
  habitId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedAt: { type: Date, default: Date.now },
  note:        { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('HabitLog', habitLogSchema);
