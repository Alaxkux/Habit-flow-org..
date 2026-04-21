const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// 🌍 Allowed frontend origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173"
];

// 🔐 CORS CONFIG (production safe)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(null, false);
    }
  },
  credentials: true
}));

// 📦 Middleware
app.use(express.json());

// 🔗 Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/habits', require('./routes/habit.routes'));
app.use('/api/logs', require('./routes/log.routes'));
app.use('/api/badges', require('./routes/badge.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

// 🧪 Health check
app.get('/', (req, res) => {
  res.send('HabitFlow API is running 🚀');
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});