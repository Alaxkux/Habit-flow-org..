const HabitLog = require('../models/HabitLog');
const Badge = require('../models/Badge');

exports.checkIn = async (req, res) => {
  try {
    const { habitId, note } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Prevent duplicate check-in same day
    const existing = await HabitLog.findOne({
      habitId, userId: req.user.id,
      completedAt: { $gte: today, $lt: tomorrow }
    });
    if (existing) return res.status(400).json({ message: 'Already checked in today' });

    const log = await HabitLog.create({ habitId, userId: req.user.id, note });

    // Check for time-based badges
    const hour = new Date().getHours();
    if (hour < 8) await Badge.create({ userId: req.user.id, badgeType: 'early_bird' }).catch(() => {});
    if (hour >= 22) await Badge.create({ userId: req.user.id, badgeType: 'night_owl' }).catch(() => {});

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { habitId, days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const query = { userId: req.user.id, completedAt: { $gte: since } };
    if (habitId) query.habitId = habitId;

    const logs = await HabitLog.find(query).sort({ completedAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStreak = async (req, res) => {
  try {
    const { habitId } = req.params;
    const logs = await HabitLog.find({ habitId, userId: req.user.id }).sort({ completedAt: -1 });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const uniqueDays = [...new Set(logs.map(l => {
      const d = new Date(l.completedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }))];

    const today = new Date();
    let checkDate = new Date(today);

    for (let i = 0; i < uniqueDays.length; i++) {
      const logDate = new Date(logs[i]?.completedAt);
      const diff = Math.floor((checkDate - logDate) / (1000 * 60 * 60 * 24));

      if (diff <= 1) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
        checkDate = logDate;
      } else {
        break;
      }
    }

    // Award streak badges
    const streakBadges = [
      { streak: 3, type: 'streak_3' },
      { streak: 7, type: 'streak_7' },
      { streak: 14, type: 'streak_14' },
      { streak: 30, type: 'streak_30' },
      { streak: 100, type: 'streak_100' },
    ];
    for (const { streak, type } of streakBadges) {
      if (currentStreak >= streak) {
        await Badge.findOneAndUpdate(
          { userId: req.user.id, badgeType: type },
          { userId: req.user.id, badgeType: type },
          { upsert: true, new: true }
        ).catch(() => {});
      }
    }

    res.json({ currentStreak, longestStreak, totalLogs: logs.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await HabitLog.find({
      userId: req.user.id,
      completedAt: { $gte: today, $lt: tomorrow }
    });

    const completedHabitIds = logs.map(l => l.habitId.toString());
    res.json({ completedHabitIds, count: completedHabitIds.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
