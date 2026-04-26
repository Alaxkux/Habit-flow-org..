const mongoose = require('mongoose');

const XP_PER_LEVEL = 100;

const LEVELS = [
  { level: 1,  title: 'Seedling',    minXP: 0    },
  { level: 2,  title: 'Sprout',      minXP: 100  },
  { level: 3,  title: 'Grower',      minXP: 250  },
  { level: 4,  title: 'Hustler',     minXP: 500  },
  { level: 5,  title: 'Consistent',  minXP: 800  },
  { level: 6,  title: 'Dedicated',   minXP: 1200 },
  { level: 7,  title: 'Disciplined', minXP: 1700 },
  { level: 8,  title: 'Master',      minXP: 2300 },
  { level: 9,  title: 'Champion',    minXP: 3000 },
  { level: 10, title: 'Legend',      minXP: 4000 },
];

const userSchema = new mongoose.Schema({
  firstName:     { type: String, required: true, trim: true },
  lastName:      { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true },
  avatar:        { type: String, default: '' },
  notifications: { type: Boolean, default: true },
  xp:            { type: Number, default: 0 },
}, { timestamps: true });

userSchema.methods.getLevelInfo = function () {
  const xp = this.xp || 0;
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) { current = LEVELS[i]; next = LEVELS[i + 1] || null; break; }
  }
  const progressXP = xp - current.minXP;
  const neededXP   = next ? next.minXP - current.minXP : 1;
  const pct        = next ? Math.min(100, Math.round((progressXP / neededXP) * 100)) : 100;
  return { level: current.level, title: current.title, xp, progressXP, neededXP, pct, maxed: !next };
};

module.exports = mongoose.model('User', userSchema);
module.exports.LEVELS = LEVELS;
