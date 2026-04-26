import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'

const CATEGORY_ORDER = ['Getting Started', 'Streaks', 'Habit Building', 'Milestones', 'Check-ins', 'Time', 'Diversity', 'Special']

const Badges = () => {
  const [data, setData] = useState({ badges: [], total: 0, earnedCount: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'earned' | 'locked'
  const [selected, setSelected] = useState(null)

  const fetchBadges = useCallback(async () => {
    try {
      const res = await api.get('/badges')
      setData(res.data)
    } catch { toast.error('Failed to load badges') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchBadges() }, [fetchBadges])

  const filtered = data.badges.filter(b =>
    filter === 'all' ? true : filter === 'earned' ? b.earned : !b.earned
  )

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = filtered.filter(b => b.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  const pct = data.total ? Math.round((data.earnedCount / data.total) * 100) : 0

  return (
    <div className="min-h-screen bg-green-50 pb-28 md:pb-8 md:ml-64 overflow-x-hidden">
      <Navbar title="Badges"/>
      <div className="h-14 md:hidden"/>

      <div className="px-4 py-4 md:px-8 md:py-8 max-w-2xl mx-auto w-full">
        <h1 className="font-display font-900 text-2xl text-gray-900 mb-1 hidden md:block">Badges</h1>

        {/* Progress card */}
        <div className="bg-white rounded-2xl p-4 shadow-card mb-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="23" fill="none" stroke="#E8F5E9" strokeWidth="6"/>
                <circle cx="28" cy="28" r="23" fill="none" stroke="#4CAF50" strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 23}
                  strokeDashoffset={(1 - pct/100) * 2 * Math.PI * 23}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-900 text-sm text-gray-900">{pct}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-display font-800 text-gray-900">{data.earnedCount} of {data.total} badges earned</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {pct === 100 ? '🏆 Complete collection!' : pct >= 50 ? '🔥 Great progress!' : '🌱 Keep going!'}
              </p>
              <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {[['all', 'All'], ['earned', '🏆 Earned'], ['locked', '🔒 Locked']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-4 py-2 rounded-2xl text-xs font-display font-800 transition-all
                ${filter === val ? 'bg-green-500 text-white shadow-sm' : 'bg-white text-gray-500 hover:bg-green-50'}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([cat, badges]) => (
              <div key={cat}>
                <h2 className="font-display font-800 text-xs text-gray-400 uppercase tracking-wider mb-2 px-1">{cat}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {badges.map(b => (
                    <button key={b.type} onClick={() => setSelected(b)}
                      className={`bg-white rounded-2xl p-4 text-center border-2 transition-all active:scale-95 text-left
                        ${b.earned ? 'border-green-100 shadow-card' : 'border-transparent shadow-sm opacity-60'}
                        hover:border-green-200`}>
                      <div className={`text-3xl mb-2 ${b.earned ? '' : 'grayscale'}`}>{b.emoji}</div>
                      <p className={`font-display font-800 text-xs leading-tight ${b.earned ? 'text-gray-900' : 'text-gray-500'}`}>{b.label}</p>
                      {b.earned && b.earnedAt && (
                        <p className="text-[10px] text-green-600 font-700 mt-1">
                          {new Date(b.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                      {!b.earned && <p className="text-[10px] text-gray-300 mt-1">Locked</p>}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(grouped).length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🎖️</div>
                <p className="font-display font-800 text-gray-700">No badges here</p>
                <p className="text-sm text-gray-400 mt-1">Start checking in to earn your first badge!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Badge detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className={`text-6xl text-center mb-4 ${selected.earned ? '' : 'grayscale'}`}>{selected.emoji}</div>
            <h3 className="font-display font-900 text-xl text-gray-900 text-center">{selected.label}</h3>
            <p className="text-sm text-gray-500 text-center mt-2">{selected.desc}</p>
            {selected.earned && selected.earnedAt && (
              <div className="mt-3 bg-green-50 rounded-2xl py-2 px-4 text-center">
                <p className="text-xs text-green-700 font-display font-700">
                  Earned on {new Date(selected.earnedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}
            {!selected.earned && (
              <div className="mt-3 bg-gray-50 rounded-2xl py-2 px-4 text-center">
                <p className="text-xs text-gray-400 font-display font-700">Not yet earned — keep going! 💪</p>
              </div>
            )}
            <button onClick={() => setSelected(null)}
              className="w-full mt-5 py-3 rounded-2xl bg-green-500 text-white font-display font-800 text-sm hover:bg-green-600 transition-all">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Badges
