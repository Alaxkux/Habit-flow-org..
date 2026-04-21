const Habit = require('../models/Habit');
const Badge = require('../models/Badge');

exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id, isActive: true }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createHabit = async (req, res) => {
  try {
    const { name, category, color, frequency, icon } = req.body;
    const habit = await Habit.create({ userId: req.user.id, name, category, color, frequency, icon });

    // Award first_habit badge
    const count = await Habit.countDocuments({ userId: req.user.id });
    if (count === 1) {
      await Badge.findOneOrCreate?.({ userId: req.user.id, badgeType: 'first_habit' }) ||
        await Badge.create({ userId: req.user.id, badgeType: 'first_habit' }).catch(() => {});
    }
    if (count === 5) {
      await Badge.create({ userId: req.user.id, badgeType: 'habit_5' }).catch(() => {});
    }

    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
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
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
