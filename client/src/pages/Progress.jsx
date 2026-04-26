import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import HeatmapCalendar from '../components/progress/HeatmapCalendar'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const COLORS = ['#4CAF50','#42A5F5','#FF7043','#AB47BC','#FFA726','#26C6DA']

const Progress = () => {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [heatmap, setHeatmap] = useState({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState('all')

  const fetchData = useCallback(async () => {
    try {
      const [habitsRes, logsRes, heatmapRes] = await Promise.all([
        api.get('/habits'),
        api.get('/logs?days=30'),
        api.get('/logs/heatmap'),
      ])
      setHabits(habitsRes.data)
      setLogs(logsRes.data)
      setHeatmap(heatmapRes.data)
    } catch { toast.error('Failed to load progress') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const dayLogs = logs.filter(l => new Date(l.completedAt).toDateString() === d.toDateString())
    return { day: DAYS[d.getDay()], completed: dayLogs.length, total: habits.length }
  })

  const filteredHabits = selected === 'all' ? habits : habits.filter(h => h._id === selected)
  const lineData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    const entry = { day: `${d.getMonth()+1}/${d.getDate()}` }
    filteredHabits.forEach(h => {
      entry[h.name] = logs.some(l => l.habitId === h._id && new Date(l.completedAt).toDateString() === d.toDateString()) ? 1 : 0
    })
    return entry
  })

  const totalDone = logs.length
  const uniqueDays = new Set(logs.map(l => new Date(l.completedAt).toDateString())).size

  const tooltipStyle = {
    contentStyle: { borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontFamily: 'Plus Jakarta Sans', fontSize: 12 }
  }

  return (
    <div className="min-h-screen bg-green-50 pb-28 md:pb-8 md:ml-64 overflow-x-hidden">
      <Navbar title="Progress"/>
      <div className="h-14 md:hidden"/>
      <div className="px-4 py-4 md:px-8 md:py-8 max-w-2xl mx-auto w-full">
        <h1 className="font-display font-900 text-2xl text-gray-900 mb-5 hidden md:block">Progress</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Check-ins', value: totalDone, emoji: '✅' },
            { label: 'Active days', value: uniqueDays, emoji: '📅' },
            { label: 'Habits', value: habits.length, emoji: '🎯' },
          ].map(({ label, value, emoji }) => (
            <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-card">
              <div className="text-2xl mb-1">{emoji}</div>
              <p className="font-display font-900 text-xl text-gray-900">{value}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Heatmap */}
            <div className="bg-white rounded-3xl p-5 shadow-card overflow-hidden">
              <HeatmapCalendar data={heatmap}/>
            </div>

            {/* Weekly Bar Chart */}
            <div className="bg-white rounded-3xl p-5 shadow-card">
              <h2 className="font-display font-800 text-gray-900 mb-4">This Week</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeklyData} barSize={24}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false}/>
                  <YAxis hide/>
                  <Tooltip {...tooltipStyle} formatter={(v) => [`${v} habits`, 'Completed']}/>
                  <Bar dataKey="completed" fill="#4CAF50" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-Habit Trend */}
            {habits.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-card">
                <div className="flex items-center justify-between mb-4 gap-2">
                  <h2 className="font-display font-800 text-gray-900">14-Day Trend</h2>
                  <select value={selected} onChange={e => setSelected(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none max-w-[140px] truncate">
                    <option value="all">All habits</option>
                    {habits.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5"/>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} interval={2}/>
                    <YAxis hide domain={[0,1]}/>
                    <Tooltip {...tooltipStyle} formatter={(v) => [v ? '✅ Done' : '—', '']}/>
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans' }}/>
                    {filteredHabits.map((h, i) => (
                      <Line key={h._id} type="monotone" dataKey={h.name}
                        stroke={COLORS[i % COLORS.length]} strokeWidth={2.5}
                        dot={{ r: 3, fill: COLORS[i % COLORS.length] }} activeDot={{ r: 5 }}/>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Completion Rate */}
            <div className="bg-white rounded-3xl p-5 shadow-card">
              <h2 className="font-display font-800 text-gray-900 mb-4">Completion Rate (30 days)</h2>
              {habits.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No habits yet</p>
              ) : (
                <div className="space-y-4">
                  {habits.map((h, i) => {
                    const count = logs.filter(l => l.habitId === h._id).length
                    const rate  = Math.min(100, Math.round((count / 30) * 100))
                    const color = COLORS[i % COLORS.length]
                    return (
                      <div key={h._id}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-display font-700 text-gray-700 truncate mr-2">{h.icon} {h.name}</span>
                          <span className="text-sm font-display font-800 flex-shrink-0" style={{ color }}>{count}x</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${rate}%`, backgroundColor: color }}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default Progress
