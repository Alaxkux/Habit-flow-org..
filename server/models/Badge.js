const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badgeType: {
    type: String,
    enum: [
      // Onboarding
      'first_habit',        // Created first habit
      'first_checkin',      // First check-in ever
      // Streaks
      'streak_3',           // 3-day streak
      'streak_7',           // 7-day streak
      'streak_14',          // 14-day streak
      'streak_30',          // 30-day streak
      'streak_60',          // 60-day streak
      'streak_100',         // 100-day streak
      'streak_365',         // 365-day streak (1 year!)
      // Habits volume
      'habit_3',            // Created 3 habits
      'habit_5',            // Created 5 habits
      'habit_10',           // Created 10 habits
      // Completion milestones
      'perfect_day',        // Completed 100% habits in a day
      'perfect_week',       // Perfect 7-day completion
      'perfect_month',      // Perfect 30-day completion
      // Time-based
      'early_bird',         // Checked in before 7am
      'night_owl',          // Checked in after 11pm
      'weekend_warrior',    // Checked in on both Saturday & Sunday
      // Diversity
      'category_master',    // Habits in 4+ different categories
      'well_rounded',       // Active habits in health, mind & productivity
      // Milestones
      'checkin_10',         // 10 total check-ins
      'checkin_50',         // 50 total check-ins
      'checkin_100',        // 100 total check-ins
      'checkin_500',        // 500 total check-ins
      // Special
      'comeback_kid',       // Returned after a 7+ day break
      'ai_explorer',        // Used AI suggestions
      'social_sharer',      // Shared progress
      'overachiever',       // Completed extra habits beyond daily goal
    ],
    required: true
  },
  earnedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
