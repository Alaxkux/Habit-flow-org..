import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import HabitCard from '../components/habits/HabitCard'
import { getGreeting } from '../utils/helpers'
import { Flame, Target, TrendingUp, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3">
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center`} style={{ backgroundColor: color + '20' }}>
      <Icon size={22} style={{ color }} />
    </div>
    <div>
      <p className="font-display font-900 text-xl text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [habits, setHabits] = useState([])
  const [completedIds, setCompletedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [streakTotal, setStreakTotal] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      const [habitsRes, todayRes] = await Promise.all([
        api.get('/habits'),
        api.get('/logs/today'),
      ])
      setHabits(habitsRes.data)
      setCompletedIds(todayRes.data.completedHabitIds)

      // Get overall streak from first habit if exists
      if (habitsRes.data.length > 0) {
        try {
          const s = await api.get(`/logs/streak/${habitsRes.data[0]._id}`)
          setStreakTotal(s.data.currentStreak)
        } catch {}
      }
    } catch {
      toast.error('Failed to load habits')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCheckIn = async (habitId) => {
    try {
      await api.post('/logs/checkin', { habitId })
      setCompletedIds(prev => [...prev, habitId])
      toast.success('Habit completed! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed')
    }
  }

  const completionRate = habits.length > 0
    ? Math.round((completedIds.length / habits.length) * 100) : 0

  const circumference = 2 * Math.PI * 36
  const progress = (completionRate / 100) * circumference

  return (
    <div className="min-h-screen bg-green-50 pb-24 md:pb-8 md:ml-64">
      <Navbar title="Dashboard" />

      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        {/* Greeting */}
        <div className="mb-6">
          <p className="text-sm text-green-700 font-display font-700">{getGreeting()},</p>
          <h1 className="font-display font-900 text-2xl md:text-3xl text-gray-900">{user?.firstName} 👋</h1>
        </div>

        {/* Progress Ring + Stats */}
        <div className="bg-white rounded-3xl p-5 shadow-card mb-5 flex items-center gap-5">
          {/* Ring */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#E8F5E9" strokeWidth="8"/>
              <circle cx="40" cy="40" r="36" fill="none" stroke="#4CAF50" strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-900 text-xl text-gray-900">{completionRate}%</span>
              <span className="text-[9px] text-gray-400 font-600">today</span>
            </div>
          </div>
          <div>
            <p className="font-display font-800 text-gray-900 text-base">
              {completedIds.length} of {habits.length} habits done
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {completionRate === 100 ? '🎉 Perfect day!' : completionRate >= 50 ? '🔥 Keep it up!' : '💪 You got this!'}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatCard icon={Flame} label="Streak" value={`${streakTotal}d`} color="#FF6F00" />
          <StatCard icon={Target} label="Done" value={completedIds.length} color="#4CAF50" />
          <StatCard icon={TrendingUp} label="Total" value={habits.length} color="#42A5F5" />
        </div>

        {/* Today's Habits */}
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
            {habits.map(habit => (
              <HabitCard key={habit._id} habit={habit}
                completed={completedIds.includes(habit._id)}
                onCheckIn={handleCheckIn} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
