const HabitLog = require('../models/HabitLog');
const Badge    = require('../models/Badge');
const User     = require('../models/User');

const XP = { checkin: 10 };

async function awardXP(userId, amount) {
  const user = await User.findByIdAndUpdate(userId, { $inc: { xp: amount } }, { new: true });
  return user ? user.getLevelInfo() : null;
}

// Date string helper — avoids all timezone/ms drift
function toDateStr(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00'); // noon avoids DST edge
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

function calcStreak(logs) {
  if (!logs.length) return { currentStreak: 0, longestStreak: 0 };

  // Unique calendar days, most recent first — pure strings
  const days = [...new Set(logs.map(l => toDateStr(l.completedAt)))].sort().reverse();

  const todayStr     = toDateStr(new Date());
  const yesterdayStr = addDays(todayStr, -1);

  // Streak is alive only if most recent check-in is today or yesterday
  if (days[0] !== todayStr && days[0] !== yesterdayStr) {
    return { currentStreak: 0, longestStreak: calcLongest(days) };
  }

  // Count consecutive days going backwards using string comparison
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    const expected = addDays(days[i - 1], -1); // one day before previous
    if (days[i] === expected) { current++; } else break;
  }

  return { currentStreak: current, longestStreak: Math.max(current, calcLongest(days)) };
}

function calcLongest(sortedDaysDesc) {
  if (!sortedDaysDesc.length) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < sortedDaysDesc.length; i++) {
    const expected = addDays(sortedDaysDesc[i - 1], -1);
    if (sortedDaysDesc[i] === expected) { cur++; best = Math.max(best, cur); } else cur = 1;
  }
  return best;
}

exports.checkIn = async (req, res) => {
  try {
    const { habitId, note } = req.body;
    const today    = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await HabitLog.findOne({ habitId, userId: req.user.id, completedAt: { $gte: today, $lt: tomorrow } });
    if (existing) return res.status(400).json({ message: 'Already checked in today' });

    const log = await HabitLog.create({ habitId, userId: req.user.id, note: note || '' });

    const xpEarned = XP.checkin;

    // Time-based badges
    const hour = new Date().getHours();
    if (hour < 7)   await Badge.findOneAndUpdate({ userId:req.user.id, badgeType:'early_bird' }, { userId:req.user.id, badgeType:'early_bird' }, { upsert:true }).catch(()=>{});
    if (hour >= 23) await Badge.findOneAndUpdate({ userId:req.user.id, badgeType:'night_owl'  }, { userId:req.user.id, badgeType:'night_owl'  }, { upsert:true }).catch(()=>{});

    // Check-in count badges
    const totalLogs = await HabitLog.countDocuments({ userId: req.user.id });
    if (totalLogs === 1) await Badge.findOneAndUpdate({ userId:req.user.id, badgeType:'first_checkin' }, { userId:req.user.id, badgeType:'first_checkin' }, { upsert:true }).catch(()=>{});
    for (const [n,t] of [[10,'checkin_10'],[50,'checkin_50'],[100,'checkin_100'],[500,'checkin_500']]) {
      if (totalLogs === n) await Badge.findOneAndUpdate({ userId:req.user.id, badgeType:t }, { userId:req.user.id, badgeType:t }, { upsert:true }).catch(()=>{});
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
    const { currentStreak, longestStreak } = calcStreak(logs);

    for (const [s,t] of [[3,'streak_3'],[7,'streak_7'],[14,'streak_14'],[30,'streak_30'],[60,'streak_60'],[100,'streak_100'],[365,'streak_365']]) {
      if (currentStreak >= s) await Badge.findOneAndUpdate({ userId:req.user.id, badgeType:t }, { userId:req.user.id, badgeType:t }, { upsert:true }).catch(()=>{});
    }

    res.json({ currentStreak, longestStreak, totalLogs: logs.length });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const today    = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const logs     = await HabitLog.find({ userId: req.user.id, completedAt: { $gte: today, $lt: tomorrow } });
    const completedHabitIds = logs.map(l => l.habitId.toString());
    const notes = {};
    logs.forEach(l => { if (l.note) notes[l.habitId.toString()] = l.note; });
    res.json({ completedHabitIds, count: completedHabitIds.length, notes });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

exports.getBestStreak = async (req, res) => {
  try {
    const Habit  = require('../models/Habit');
    const habits = await Habit.find({ userId: req.user.id, isActive: true });
    let best = 0;
    for (const h of habits) {
      const logs = await HabitLog.find({ habitId: h._id, userId: req.user.id }).sort({ completedAt: -1 });
      const { currentStreak } = calcStreak(logs);
      if (currentStreak > best) best = currentStreak;
    }
    res.json({ bestStreak: best });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

exports.getHeatmap = async (req, res) => {
  try {
    const since = new Date(); since.setDate(since.getDate() - 364); since.setHours(0,0,0,0);
    const logs  = await HabitLog.find({ userId: req.user.id, completedAt: { $gte: since } });
    const map   = {};
    logs.forEach(l => { map[toDateStr(l.completedAt)] = (map[toDateStr(l.completedAt)] || 0) + 1; });
    res.json(map);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

exports.getXP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.getLevelInfo());
  } catch { res.status(500).json({ message: 'Server error' }); }
};

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
