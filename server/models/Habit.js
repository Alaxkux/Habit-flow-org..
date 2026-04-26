const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  category:    { type: String, enum: ['health','fitness','mindfulness','learning','productivity','social','other'], default: 'other' },
  color:       { type: String, default: '#4CAF50' },
  frequency:   { type: String, enum: ['daily','weekdays','weekends','weekly'], default: 'daily' },
  icon:        { type: String, default: '✅' },
  isActive:    { type: Boolean, default: true },
  reminderTime:{ type: String, default: '' },           // "HH:MM" optional
  goalType:    { type: String, enum: ['daily','weekly','monthly','once'], default: 'daily' },
  goalTarget:  { type: Number, default: 1 },            // e.g. 3 times per week
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
