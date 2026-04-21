const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/habits', require('./routes/habit.routes'));
app.use('/api/logs', require('./routes/log.routes'));
app.use('/api/badges', require('./routes/badge.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

app.get('/', (req, res) => res.send('HabitFlow API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
