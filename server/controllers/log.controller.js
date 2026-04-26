const HabitLog = require('../models/HabitLog');
const Badge    = require('../models/Badge');
const User     = require('../models/User');

// XP rewards
const XP = { checkin: 10, streak_bonus: 5, perfect_day: 25 };

async function awardXP(userId, amount) {
  const user = await User.findByIdAndUpdate(userId, { $inc: { xp: amount } }, { new: true });
  return user ? user.getLevelInfo() : null;
}

exports.checkIn = async (req, res) => {
  try {
    const { habitId, note } = req.body;
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);

    const existing = await HabitLog.findOne({ habitId, userId: req.user.id, completedAt: { $gte: today, $lt: tomorrow } });
    if (existing) return res.status(400).json({ message: 'Already checked in today' });

    const log = await HabitLog.create({ habitId, userId: req.user.id, note: note || '' });

    // Award base XP
    let xpEarned = XP.checkin;

    // Time-based badges
    const hour = new Date().getHours();
    if (hour < 7)  await Badge.findOneAndUpdate({ userId: req.user.id, badgeType: 'early_bird' }, { userId: req.user.id, badgeType: 'early_bird' }, { upsert: true }).catch(()=>{});
    if (hour >= 23) await Badge.findOneAndUpdate({ userId: req.user.id, badgeType: 'night_owl' }, { userId: req.user.id, badgeType: 'night_owl' }, { upsert: true }).catch(()=>{});

    // First check-in badge
    const totalLogs = await HabitLog.countDocuments({ userId: req.user.id });
    if (totalLogs === 1) await Badge.findOneAndUpdate({ userId: req.user.id, badgeType: 'first_checkin' }, { userId: req.user.id, badgeType: 'first_checkin' }, { upsert: true }).catch(()=>{});

    // Check-in count badges
    const countBadges = [{ n:10, t:'checkin_10' },{ n:50, t:'checkin_50' },{ n:100, t:'checkin_100' },{ n:500, t:'checkin_500' }];
    for (const { n, t } of countBadges) {
      if (totalLogs === n) await Badge.findOneAndUpdate({ userId: req.user.id, badgeType: t }, { userId: req.user.id, badgeType: t }, { upsert: true }).catch(()=>{});
    }

    const levelInfo = await awardXP(req.user.id, xpEarned);
    res.status(201).json({ log, xpEarned, levelInfo });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.getLogs = async (req, res) => {
  try {
    const { habitId, days = 365 } = req.query;
    const since = new Date(); since.setDate(since.getDate() - parseInt(days));
    const query = { userId: req.user.id, completedAt: { $gte: since } };
    if (habitId) query.habitId = habitId;
    const logs = await HabitLog.find(query).sort({ completedAt: -1 });
    res.json(logs);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

exports.getStreak = async (req, res) => {
  try {
    const { habitId } = req.params;
    const logs = await HabitLog.find({ habitId, userId: req.user.id }).sort({ completedAt: -1 });
    let currentStreak = 0, longestStreak = 0, tempStreak = 0;
    const today = new Date(); let checkDate = new Date(today);

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].completedAt);
      const diff = Math.floor((checkDate - logDate) / (1000*60*60*24));
      if (diff <= 1) { tempStreak++; if (i===0) currentStreak=tempStreak; longestStreak=Math.max(longestStreak,tempStreak); checkDate=logDate; }
      else break;
    }

    const streakBadges = [{ s:3,t:'streak_3' },{ s:7,t:'streak_7' },{ s:14,t:'streak_14' },{ s:30,t:'streak_30' },{ s:60,t:'streak_60' },{ s:100,t:'streak_100' },{ s:365,t:'streak_365' }];
    for (const { s, t } of streakBadges) {
      if (currentStreak >= s) await Badge.findOneAndUpdate({ userId: req.user.id, badgeType: t }, { userId: req.user.id, badgeType: t }, { upsert: true }).catch(()=>{});
    }

    res.json({ currentStreak, longestStreak, totalLogs: logs.length });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const logs = await HabitLog.find({ userId: req.user.id, completedAt: { $gte: today, $lt: tomorrow } });
    const completedHabitIds = logs.map(l => l.habitId.toString());
    const notes = {};
    logs.forEach(l => { if (l.note) notes[l.habitId.toString()] = l.note; });
    res.json({ completedHabitIds, count: completedHabitIds.length, notes });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// Heatmap — last 365 days, grouped by date
exports.getHeatmap = async (req, res) => {
  try {
    const since = new Date(); since.setDate(since.getDate() - 364);
    since.setHours(0,0,0,0);
    const logs = await HabitLog.find({ userId: req.user.id, completedAt: { $gte: since } });
    const map = {};
    logs.forEach(l => {
      const d = new Date(l.completedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      map[key] = (map[key] || 0) + 1;
    });
    res.json(map);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// XP info for current user
exports.getXP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.getLevelInfo());
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// Spend XP (for XP store purchases)
exports.spendXP = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    const user = await User.findById(req.user.id);
    if (!user || user.xp < amount) return res.status(400).json({ message: 'Not enough XP' });
    user.xp -= amount;
    await user.save();
    res.json(user.getLevelInfo());
  } catch { res.status(500).json({ message: 'Server error' }); }
};
