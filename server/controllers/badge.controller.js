const Badge = require('../models/Badge');

const BADGE_META = {
  first_habit:  { label: 'First Step',      emoji: '🌱', desc: 'Created your first habit' },
  streak_3:     { label: '3-Day Streak',    emoji: '🔥', desc: 'Maintained a 3-day streak' },
  streak_7:     { label: 'Week Warrior',    emoji: '⚡', desc: 'Maintained a 7-day streak' },
  streak_14:    { label: 'Fortnight Force', emoji: '💪', desc: 'Maintained a 14-day streak' },
  streak_30:    { label: 'Monthly Master',  emoji: '🏆', desc: 'Maintained a 30-day streak' },
  streak_100:   { label: 'Century Club',    emoji: '💎', desc: 'Maintained a 100-day streak' },
  habit_5:      { label: 'Habit Builder',   emoji: '🧱', desc: 'Created 5 habits' },
  perfect_week: { label: 'Perfect Week',    emoji: '⭐', desc: 'Completed all habits for 7 days' },
  early_bird:   { label: 'Early Bird',      emoji: '🌅', desc: 'Checked in before 8 AM' },
  night_owl:    { label: 'Night Owl',       emoji: '🦉', desc: 'Checked in after 10 PM' },
  ai_explorer:  { label: 'AI Explorer',     emoji: '🤖', desc: 'Used AI habit suggestions' },
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
