const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badgeType: {
    type: String,
    enum: [
      'first_habit',     // Created first habit
      'streak_3',        // 3-day streak
      'streak_7',        // 7-day streak
      'streak_14',       // 14-day streak
      'streak_30',       // 30-day streak
      'streak_100',      // 100-day streak
      'habit_5',         // Created 5 habits
      'perfect_week',    // Completed all habits for 7 days
      'early_bird',      // Checked in before 8am
      'night_owl',       // Checked in after 10pm
      'ai_explorer',     // Used AI suggestions
    ],
    required: true
  },
  earnedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
