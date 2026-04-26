const Badge = require('../models/Badge');

const BADGE_META = {
  // Onboarding
  first_habit:      { label: 'First Step',        emoji: '🌱', desc: 'Created your very first habit', category: 'Getting Started' },
  first_checkin:    { label: 'Day One',            emoji: '✅', desc: 'Completed your first check-in', category: 'Getting Started' },
  // Streaks
  streak_3:         { label: 'Tricycle',           emoji: '🚲', desc: '3 days in a row — momentum building!', category: 'Streaks' },
  streak_7:         { label: 'Week Warrior',       emoji: '⚡', desc: 'A full week without breaking the chain', category: 'Streaks' },
  streak_14:        { label: 'Fortnight Force',    emoji: '💪', desc: '14 consecutive days of discipline', category: 'Streaks' },
  streak_30:        { label: 'Monthly Master',     emoji: '🏅', desc: 'A whole month of consistency', category: 'Streaks' },
  streak_60:        { label: 'Iron Will',          emoji: '🦾', desc: '60 days — habits are now automatic', category: 'Streaks' },
  streak_100:       { label: 'Century Club',       emoji: '💎', desc: '100 days of unstoppable habit power', category: 'Streaks' },
  streak_365:       { label: 'Legendary',          emoji: '👑', desc: 'A full year. You are truly legendary.', category: 'Streaks' },
  // Habit Volume
  habit_3:          { label: 'Juggler',            emoji: '🤹', desc: 'Managing 3 active habits', category: 'Habit Building' },
  habit_5:          { label: 'Habit Builder',      emoji: '🧱', desc: 'Created 5 habits — a solid routine', category: 'Habit Building' },
  habit_10:         { label: 'Routine Architect',  emoji: '🏗️', desc: 'Built a system of 10 habits', category: 'Habit Building' },
  // Completion
  perfect_day:      { label: 'Perfect Day',        emoji: '⭐', desc: 'Completed 100% of habits in one day', category: 'Milestones' },
  perfect_week:     { label: 'Flawless Week',      emoji: '🌟', desc: 'Perfect completion for 7 days straight', category: 'Milestones' },
  perfect_month:    { label: 'Flawless Month',     emoji: '🌠', desc: 'Perfect completion for 30 days', category: 'Milestones' },
  // Time-based
  early_bird:       { label: 'Early Bird',         emoji: '🌅', desc: 'Checked in before 7 AM — rise & grind', category: 'Time' },
  night_owl:        { label: 'Night Owl',          emoji: '🦉', desc: 'Checked in after 11 PM — burning midnight oil', category: 'Time' },
  weekend_warrior:  { label: 'Weekend Warrior',    emoji: '🛡️', desc: 'Stayed consistent through the weekend', category: 'Time' },
  // Check-in volume
  checkin_10:       { label: 'Getting Warm',       emoji: '🌤️', desc: '10 total check-ins completed', category: 'Check-ins' },
  checkin_50:       { label: 'In the Zone',        emoji: '🎯', desc: '50 total check-ins — serious dedication', category: 'Check-ins' },
  checkin_100:      { label: 'Triple Digits',      emoji: '💯', desc: '100 check-ins — elite consistency', category: 'Check-ins' },
  checkin_500:      { label: 'Half Thousand',      emoji: '🔱', desc: '500 total check-ins. Absolutely elite.', category: 'Check-ins' },
  // Diversity
  category_master:  { label: 'All-Rounder',        emoji: '🎭', desc: 'Habits spanning 4+ life categories', category: 'Diversity' },
  well_rounded:     { label: 'Well Rounded',       emoji: '🌀', desc: 'Active in health, mind & productivity', category: 'Diversity' },
  // Special
  comeback_kid:     { label: 'Comeback Kid',       emoji: '🔄', desc: 'Returned strong after a break — resilient!', category: 'Special' },
  ai_explorer:      { label: 'AI Explorer',        emoji: '🤖', desc: 'Used AI to supercharge your habits', category: 'Special' },
  overachiever:     { label: 'Overachiever',       emoji: '🚀', desc: 'Went above and beyond your daily goal', category: 'Special' },
};

exports.getBadges = async (req, res) => {
  try {
    const earned = await Badge.find({ userId: req.user.id }).sort({ earnedAt: -1 });
    const earnedTypes = earned.map(b => b.badgeType);

    const all = Object.entries(BADGE_META).map(([type, meta]) => ({
      type,
      ...meta,
      earned: earnedTypes.includes(type),
      earnedAt: earned.find(b => b.badgeType === type)?.earnedAt || null,
    }));

    res.json({ badges: all, total: all.length, earnedCount: earnedTypes.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
