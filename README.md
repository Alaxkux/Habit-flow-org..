# HabitFlow 🌱

A full-stack MERN habit tracker with AI coaching, streaks, badges, and progress analytics.

## Stack
- **Frontend:** React + Vite + Tailwind CSS + Recharts
- **Backend:** Node.js + Express + MongoDB + Mongoose
- **Auth:** JWT
- **AI:** Anthropic Claude API

---

## Setup

### 1. Server
```bash
cd server
npm install
```

Edit `.env`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_random_secret_string
ANTHROPIC_API_KEY=your_anthropic_api_key
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

### 2. Client
```bash
cd client
npm install
npm run dev
```

Open: http://localhost:5173

---

## Features
- ✅ Login / Signup with JWT auth
- 🎯 Create, edit, delete habits (name, icon, color, category, frequency)
- 📅 Daily check-ins with duplicate prevention
- 🔥 Streak tracking per habit
- 📊 Weekly bar chart + 14-day line trend + completion rates
- 🏆 11 unique badges (streak milestones, first habit, perfect week, etc.)
- 🤖 AI habit suggestions powered by Claude
- ⚙️ Profile editing + password change
- 📱 Fully mobile responsive (bottom nav on mobile, sidebar on desktop)

---

## Deployment
- **Frontend:** Vercel (add `VITE_API_URL=https://your-backend.com/api` to env)
- **Backend:** Render or Railway
- **Database:** MongoDB Atlas (free tier)

Add `vercel.json` to client for SPA routing:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
# Habit-flow-org..
