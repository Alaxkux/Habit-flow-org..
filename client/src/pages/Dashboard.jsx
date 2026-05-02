import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePowerUp } from '../context/PowerUpContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import HabitCard from '../components/habits/HabitCard'
import XPCard from '../components/ui/XPCard'
import { getGreeting } from '../utils/helpers'
import { launchConfetti } from '../utils/confetti'
import { pushNotification } from '../utils/notifications'
import { Flame, CheckSquare, Target, Plus, Zap } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="theme-card rounded-2xl p-3 shadow-card flex items-center gap-2 min-w-0 overflow-hidden">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: color + '22' }}>
      <Icon size={18} style={{ color }}/>
    </div>
    <div className="min-w-0">
      <p className="font-display font-900 text-lg theme-text leading-none">{value}</p>
      <p className="text-[10px] theme-sub mt-0.5 truncate">{label}</p>
    </div>
  </div>
)

const Dashboard = () => {
  const { user }   = useAuth()
  const { getXPMultiplier, getConfetiDuration, hasPerk } = usePowerUp()
  const navigate   = useNavigate()
  const location   = useLocation()

  const [habits,       setHabits]       = useState([])
  const [completedIds, setCompletedIds] = useState([])
  const [todayNotes,   setTodayNotes]   = useState({})
  const [loading,      setLoading]      = useState(true)
  const [streakMap,    setStreakMap]     = useState({})
  const [bestStreak,   setBestStreak]   = useState(0)
  const [celebrated,   setCelebrated]   = useState(false)
  const [levelInfo,    setLevelInfo]    = useState(null)
  const [xpPop,        setXpPop]        = useState(null)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [habitsRes, todayRes, xpRes] = await Promise.all([
        api.get('/habits'),
        api.get('/logs/today'),
        api.get('/logs/xp'),
      ])
      const fetchedHabits    = habitsRes.data
      const fetchedCompleted = todayRes.data.completedHabitIds

      setHabits(fetchedHabits)
      setLevelInfo(xpRes.data)
      setTodayNotes(todayRes.data.notes || {})

      const validIds = fetchedCompleted.filter(id => fetchedHabits.some(h => h._id === id))
      setCompletedIds(validIds)

      if (fetchedHabits.length === 0 || validIds.length < fetchedHabits.length) setCelebrated(false)

      const sMap = {}
      await Promise.all(fetchedHabits.map(async h => {
        try { const s = await api.get(`/logs/streak/${h._id}`); sMap[h._id] = s.data.currentStreak } catch {}
      }))
      setStreakMap(sMap)
      setBestStreak(Math.max(0, ...Object.values(sMap)))
    } catch { if (!silent) toast.error('Failed to load') }
    finally { if (!silent) setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Re-fetch on visibility change (switching tabs/apps)
  useEffect(() => {
    const h = () => { if (document.visibilityState === 'visible') fetchData(true) }
    document.addEventListener('visibilitychange', h)
    return () => document.removeEventListener('visibilitychange', h)
  }, [fetchData])

  // Re-fetch silently on route change back to dashboard
  const prevPath = useState(location.pathname)[0]
  useEffect(() => {
    if (prevPath !== location.pathname) fetchData(true)
  }, [location.pathname])

  const sortedHabits = [...habits].sort((a, b) => {
    if (a.reminderTime && b.reminderTime) return a.reminderTime.localeCompare(b.reminderTime)
    if (a.reminderTime) return -1
    if (b.reminderTime) return 1
    return 0
  })

  const handleCheckIn = async (habitId, note = '') => {
    if (completedIds.includes(habitId)) return
    try {
      const res          = await api.post('/logs/checkin', { habitId, note })
      const newCompleted = [...completedIds, habitId]
      setCompletedIds(newCompleted)
      if (note) setTodayNotes(prev => ({ ...prev, [habitId]: note }))

      const habit     = habits.find(h => h._id === habitId)
      const habitName = habit?.name || 'Habit'

      // Streak — fetch updated streak after check-in
      try {
        const sRes          = await api.get(`/logs/streak/${habitId}`)
        const currentStreak = sRes.data.currentStreak
        const prevStreak    = streakMap[habitId] || 0
        const newMap        = { ...streakMap, [habitId]: currentStreak }
        setStreakMap(newMap)
        setBestStreak(Math.max(0, ...Object.values(newMap)))

        const prefs = (() => { try { return JSON.parse(localStorage.getItem('hf_notif_settings')) || {} } catch { return {} } })()

        // Streak notification: ONLY on day 1 (brand new streak start)
        if (prefs.streaks !== false) {
          if (currentStreak === 1 && prevStreak === 0) {
            // First ever day — streak just started
            pushNotification({ type:'streak', title:'🔥 Streak started!', body:`"${habitName}" — day 1. Keep it up!` })
          }
          // All other streak milestones: silent — user sees the stat card update
          // This prevents notification spam on every single check-in
        }
      } catch {}

      // XP with powerup multiplier
      if (res.data?.levelInfo) {
        const prev    = levelInfo
        const next    = res.data.levelInfo
        const mult    = getXPMultiplier()
        const base    = res.data.xpEarned || 10
        const display = mult > 1 ? Math.round(base * mult) : base

        setLevelInfo(next)
        setXpPop(`+${display} XP${mult > 1 ? ` ×${mult}` : ''}`)
        setTimeout(() => setXpPop(null), 2000)

        if (prev && next.level > prev.level) {
          const prefs = (() => { try { return JSON.parse(localStorage.getItem('hf_notif_settings')) || {} } catch { return {} } })()
          if (prefs.badges !== false) {
            pushNotification({ type:'xp', title:`⚡ Level Up! Lv.${next.level}`, body:`You're now "${next.title}"!` })
          }
          setTimeout(() => {
            launchConfetti({ duration: getConfetiDuration() })
            toast.success(`🎉 Level Up! Lv.${next.level} — ${next.title}!`, { duration: 5000 })
          }, 200)
          return
        }
      }

      // Perfect day
      if (newCompleted.length === habits.length && habits.length > 0 && !celebrated) {
        setCelebrated(true)
        const prefs = (() => { try { return JSON.parse(localStorage.getItem('hf_notif_settings')) || {} } catch { return {} } })()
        if (prefs.badges !== false) {
          pushNotification({ type:'badge', title:'⭐ Perfect Day!', body:'Every habit done today. Exceptional!' })
        }
        setTimeout(() => {
          launchConfetti({ duration: getConfetiDuration() })
          toast.success('🎉 Perfect day! Every habit done!', { duration: 4000 })
        }, 300)
      } else {
        toast.success(`${habitName} ✅`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed')
    }
  }

  const completionRate = habits.length > 0 ? Math.round((completedIds.length / habits.length) * 100) : 0
  const circumference  = 2 * Math.PI * 36
  const streakDisplay  = hasPerk('streak_fire') ? ('🔥'.repeat(Math.min(bestStreak, 5)) || '0') : `${bestStreak}d`

  return (
    <div className="min-h-screen theme-bg pb-28 md:pb-8 md:ml-72 overflow-x-hidden">
      <Navbar title="Dashboard"/>
      <div className="h-14 md:hidden"/>
      <div className="px-4 py-4 md:px-8 md:py-8 max-w-2xl mx-auto w-full">

        <div className="mb-5">
          <p className="text-sm font-display font-700" style={{ color:'var(--color-accent)' }}>{getGreeting()},</p>
          <h1 className="font-display font-900 text-2xl theme-text">{user?.firstName} 👋</h1>
        </div>

        {/* XP Card */}
        <div className="relative mb-4">
          <XPCard levelInfo={levelInfo}/>
          {xpPop && (
            <div className="absolute top-2 right-3 pointer-events-none animate-bounce">
              <span className="text-white text-xs font-display font-900 px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1"
                style={{ backgroundColor:'var(--color-accent)' }}>
                <Zap size={11}/>{xpPop}
              </span>
            </div>
          )}
        </div>

        {/* Progress ring */}
        <div className="theme-card rounded-3xl p-5 shadow-card mb-4 flex items-center gap-5 overflow-hidden">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="var(--color-accent-light)" strokeWidth="8"/>
              <circle cx="40" cy="40" r="36" fill="none" stroke="var(--color-accent)" strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (completionRate/100)*circumference}
                strokeLinecap="round" style={{ transition:'stroke-dashoffset 0.6s ease' }}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-900 text-lg theme-text leading-none">{completionRate}%</span>
              <span className="text-[9px] theme-sub font-600">today</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-display font-800 theme-text">{completedIds.length} of {habits.length} done</p>
            <p className="text-sm theme-sub mt-1">
              {habits.length === 0 ? '🌱 Create your first habit!'
                : completionRate === 100 ? '🎉 Perfect day!'
                : completionRate >= 50  ? '🔥 Keep it up!'
                : '💪 You got this!'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <StatCard icon={Flame}       label="Best Streak" value={streakDisplay}       color="#FF6F00"/>
          <StatCard icon={CheckSquare} label="Done Today"  value={completedIds.length} color="var(--color-accent)"/>
          <StatCard icon={Target}      label="My Habits"   value={habits.length}       color="#42A5F5"/>
        </div>

        {/* Today's habits */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-900 theme-text">Today's Habits</h2>
          <button onClick={() => navigate('/habits')}
            className="flex items-center gap-1 text-xs font-700 px-3 py-1.5 rounded-xl transition-all"
            style={{ backgroundColor:'var(--color-accent-light)', color:'var(--color-accent-text)' }}>
            <Plus size={14}/> Add
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor:'var(--color-accent)', borderTopColor:'transparent' }}/>
          </div>
        ) : habits.length === 0 ? (
          <div className="theme-card rounded-3xl p-8 text-center shadow-card">
            <div className="text-4xl mb-3">🌱</div>
            <p className="font-display font-800 theme-text">No habits yet</p>
            <p className="text-sm theme-sub mb-4">Start by creating your first habit</p>
            <button onClick={() => navigate('/habits')}
              className="text-white px-6 py-2.5 rounded-2xl font-display font-800 text-sm transition-all"
              style={{ backgroundColor:'var(--color-accent)' }}>
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
