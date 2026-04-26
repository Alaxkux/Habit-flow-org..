import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import HabitCard from '../components/habits/HabitCard'
import XPCard from '../components/ui/XPCard'
import { getGreeting } from '../utils/helpers'
import { launchConfetti } from '../utils/confetti'
import { pushNotification } from '../utils/notifications'
import { Flame, Target, TrendingUp, Plus, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-3 shadow-card flex items-center gap-2 min-w-0 overflow-hidden">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
      <Icon size={18} style={{ color }}/>
    </div>
    <div className="min-w-0">
      <p className="font-display font-900 text-lg text-gray-900 leading-none">{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{label}</p>
    </div>
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [habits, setHabits] = useState([])
  const [completedIds, setCompletedIds] = useState([])
  const [todayNotes, setTodayNotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [streakMap, setStreakMap] = useState({}) // habitId -> streak count
  const [celebrated, setCelebrated] = useState(false)
  const [levelInfo, setLevelInfo] = useState(null)
  const [xpPop, setXpPop] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [habitsRes, todayRes, xpRes] = await Promise.all([
        api.get('/habits'),
        api.get('/logs/today'),
        api.get('/logs/xp'),
      ])
      const fetchedHabits = habitsRes.data
      setHabits(fetchedHabits)
      setCompletedIds(todayRes.data.completedHabitIds)
      setTodayNotes(todayRes.data.notes || {})
      setLevelInfo(xpRes.data)

      // Fetch streaks for all habits
      const streaks = {}
      await Promise.all(fetchedHabits.map(async h => {
        try {
          const s = await api.get(`/logs/streak/${h._id}`)
          streaks[h._id] = s.data.currentStreak
        } catch {}
      }))
      setStreakMap(streaks)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Sort habits: by reminderTime asc (habits with time first), then no-time habits
  const sortedHabits = [...habits].sort((a, b) => {
    if (a.reminderTime && b.reminderTime) return a.reminderTime.localeCompare(b.reminderTime)
    if (a.reminderTime && !b.reminderTime) return -1
    if (!a.reminderTime && b.reminderTime) return 1
    return 0
  })

  const handleCheckIn = async (habitId, note = '') => {
    if (completedIds.includes(habitId)) return
    try {
      const res = await api.post('/logs/checkin', { habitId, note })
      const newCompleted = [...completedIds, habitId]
      setCompletedIds(newCompleted)
      if (note) setTodayNotes(prev => ({ ...prev, [habitId]: note }))

      const habit = habits.find(h => h._id === habitId)
      const habitName = habit?.name || 'Habit'

      // Streak check
      try {
        const sRes = await api.get(`/logs/streak/${habitId}`)
        const currentStreak = sRes.data.currentStreak
        const prevStreak = streakMap[habitId] || 0
        setStreakMap(prev => ({ ...prev, [habitId]: currentStreak }))

        if (currentStreak === 1 && prevStreak === 0) {
          // Brand new streak
          pushNotification({ type: 'streak', title: '🔥 Streak started!', body: `"${habitName}" streak is live — day 1!` })
        } else if (currentStreak > prevStreak && currentStreak > 1) {
          // Streak extended
          pushNotification({ type: 'streak', title: `🔥 ${currentStreak}-day streak!`, body: `"${habitName}" is on a roll — keep it going!` })
        } else if (prevStreak > 0 && currentStreak === 1 && prevStreak > 1) {
          // Streak restored after a break
          pushNotification({ type: 'streak', title: '⚡ Streak restored!', body: `"${habitName}" is back on track! Don't stop now.` })
        }
      } catch {}

      // XP update
      if (res.data?.levelInfo) {
        const prev = levelInfo
        const next = res.data.levelInfo
        setLevelInfo(next)
        const xpGained = res.data.xpEarned || 10
        setXpPop(`+${xpGained} XP`)
        setTimeout(() => setXpPop(null), 1800)

        if (prev && next.level > prev.level) {
          pushNotification({ type: 'xp', title: `⚡ Level Up! Lv.${next.level}`, body: `You've reached "${next.title}" — incredible progress!` })
          setTimeout(() => {
            launchConfetti({ duration: 3500 })
            toast.success(`🎉 Level Up! You're now Lv.${next.level} — ${next.title}!`, { duration: 5000 })
          }, 200)
          return
        }
      }

      // Perfect day
      if (newCompleted.length === habits.length && habits.length > 0 && !celebrated) {
        setCelebrated(true)
        pushNotification({ type: 'badge', title: '⭐ Perfect Day!', body: 'You completed every habit today. Exceptional!' })
        setTimeout(() => {
          launchConfetti({ duration: 3000 })
          toast.success('🎉 Perfect day! Every habit done!', { duration: 4000 })
        }, 300)
      } else {
        toast.success(`${habitName} ✅`)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in failed'
      toast.error(msg)
    }
  }

  const completionRate = habits.length > 0 ? Math.round((completedIds.length / habits.length) * 100) : 0
  const circumference  = 2 * Math.PI * 36
  const totalStreak    = Object.values(streakMap).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-green-50 pb-28 md:pb-8 md:ml-64 overflow-x-hidden">
      <Navbar title="Dashboard"/>

      {/* Spacer for fixed navbar on mobile */}
      <div className="h-14 md:hidden"/>

      <div className="px-4 py-4 md:px-8 md:py-8 max-w-2xl mx-auto w-full">

        <div className="mb-5">
          <p className="text-sm text-green-700 font-display font-700">{getGreeting()},</p>
          <h1 className="font-display font-900 text-2xl text-gray-900">{user?.firstName} 👋</h1>
        </div>

        {/* XP Card */}
        <div className="relative mb-4">
          <XPCard levelInfo={levelInfo}/>
          {xpPop && (
            <div className="absolute top-2 right-3 pointer-events-none animate-bounce">
              <span className="bg-amber-400 text-white text-xs font-display font-900 px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Zap size={11}/>{xpPop}
              </span>
            </div>
          )}
        </div>

        {/* Progress ring */}
        <div className="bg-white rounded-3xl p-5 shadow-card mb-4 flex items-center gap-5 overflow-hidden">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#E8F5E9" strokeWidth="8"/>
              <circle cx="40" cy="40" r="36" fill="none" stroke="#4CAF50" strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={circumference - (completionRate/100)*circumference}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-900 text-lg text-gray-900 leading-none">{completionRate}%</span>
              <span className="text-[9px] text-gray-400 font-600">today</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-display font-800 text-gray-900">{completedIds.length} of {habits.length} done</p>
            <p className="text-sm text-gray-400 mt-1">
              {completionRate === 100 ? '🎉 Perfect day!' : completionRate >= 50 ? '🔥 Keep it up!' : '💪 You got this!'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <StatCard icon={Flame}      label="Streak"  value={`${totalStreak}d`}     color="#FF6F00"/>
          <StatCard icon={Target}     label="Done"    value={completedIds.length}   color="#4CAF50"/>
          <StatCard icon={TrendingUp} label="Habits"  value={habits.length}         color="#42A5F5"/>
        </div>

        {/* Today's habits */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-900 text-gray-900">Today's Habits</h2>
          <button onClick={() => navigate('/habits')}
            className="flex items-center gap-1 text-xs text-green-700 font-700 bg-green-100 px-3 py-1.5 rounded-xl hover:bg-green-200 transition-all">
            <Plus size={14}/> Add
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : habits.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-card">
            <div className="text-4xl mb-3">🌱</div>
            <p className="font-display font-800 text-gray-700">No habits yet</p>
            <p className="text-sm text-gray-400 mb-4">Start by creating your first habit</p>
            <button onClick={() => navigate('/habits')}
              className="bg-green-500 text-white px-6 py-2.5 rounded-2xl font-display font-800 text-sm hover:bg-green-600 transition-all">
              Create Habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedHabits.map(habit => (
              <HabitCard key={habit._id} habit={habit}
                completed={completedIds.includes(habit._id)}
                todayNote={todayNotes[habit._id]}
                onCheckIn={handleCheckIn}/>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
