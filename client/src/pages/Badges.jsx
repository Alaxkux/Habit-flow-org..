import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'

const Badges = () => {
  const [data, setData] = useState({ badges: [], total: 0, earnedCount: 0 })
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/badges')
      setData(res.data)
    } catch { toast.error('Failed to load badges') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const earned = data.badges.filter(b => b.earned)
  const locked = data.badges.filter(b => !b.earned)

  return (
    <div className="min-h-screen bg-green-50 pb-24 md:pb-8 md:ml-64">
      <Navbar title="Badges" />

      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <h1 className="font-display font-900 text-2xl text-gray-900 mb-1 hidden md:block">Badges</h1>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl p-4 shadow-card mb-5">
          <div className="flex justify-between mb-2">
            <p className="text-sm font-display font-700 text-gray-700">Collection Progress</p>
            <p className="text-sm font-display font-800 text-green-600">{data.earnedCount}/{data.total}</p>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
              style={{ width: `${data.total ? (data.earnedCount / data.total) * 100 : 0}%` }} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            {/* Earned */}
            {earned.length > 0 && (
              <div className="mb-6">
                <h2 className="font-display font-800 text-gray-900 mb-3">Earned 🏆</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {earned.map(b => (
                    <div key={b.type} className="bg-white rounded-2xl p-4 shadow-card text-center border-2 border-green-100">
                      <div className="text-4xl mb-2">{b.emoji}</div>
                      <p className="font-display font-800 text-sm text-gray-900">{b.label}</p>
                      <p className="text-xs text-gray-400 mt-1">{b.desc}</p>
                      {b.earnedAt && (
                        <p className="text-[10px] text-green-600 font-700 mt-2">
                          {new Date(b.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked */}
            {locked.length > 0 && (
              <div>
                <h2 className="font-display font-800 text-gray-900 mb-3">Locked 🔒</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {locked.map(b => (
                    <div key={b.type} className="bg-white rounded-2xl p-4 shadow-card text-center opacity-50">
                      <div className="text-4xl mb-2 grayscale">{b.emoji}</div>
                      <p className="font-display font-800 text-sm text-gray-500">{b.label}</p>
                      <p className="text-xs text-gray-400 mt-1">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.badges.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🎖️</div>
                <p className="font-display font-800 text-gray-700">No badges yet</p>
                <p className="text-sm text-gray-400 mt-1">Start checking in to earn your first badge!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Badges
