const Habit = require('../models/Habit');
const Badge = require('../models/Badge');

exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id, isActive: true });
    // Bug 4 fix: sort by reminderTime (earliest first), then by createdAt
    habits.sort((a, b) => {
      if (a.reminderTime && b.reminderTime) return a.reminderTime.localeCompare(b.reminderTime)
      if (a.reminderTime && !b.reminderTime) return -1
      if (!a.reminderTime && b.reminderTime) return 1
      return new Date(a.createdAt) - new Date(b.createdAt)
    })
    res.json(habits);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.createHabit = async (req, res) => {
  try {
    const { name, category, color, frequency, icon, reminderTime, goalType, goalTarget } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const habit = await Habit.create({
      userId: req.user.id, name, category, color, frequency, icon,
      reminderTime: reminderTime || '',
      goalType: goalType || 'daily',
      goalTarget: goalTarget || 1,
    });

    // Badges
    const count = await Habit.countDocuments({ userId: req.user.id, isActive: true });
    if (count === 1) await Badge.findOneAndUpdate({ userId: req.user.id, badgeType: 'first_habit' }, { userId: req.user.id, badgeType: 'first_habit' }, { upsert: true }).catch(()=>{});
    if (count === 3) await Badge.findOneAndUpdate({ userId: req.user.id, badgeType: 'habit_3' },    { userId: req.user.id, badgeType: 'habit_3' },    { upsert: true }).catch(()=>{});
    if (count === 5) await Badge.findOneAndUpdate({ userId: req.user.id, badgeType: 'habit_5' },    { userId: req.user.id, badgeType: 'habit_5' },    { upsert: true }).catch(()=>{});
    if (count === 10) await Badge.findOneAndUpdate({ userId: req.user.id, badgeType: 'habit_10' },  { userId: req.user.id, badgeType: 'habit_10' },   { upsert: true }).catch(()=>{});

    res.status(201).json(habit);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json(habit);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isActive: false },
      { new: true }
    );
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};
