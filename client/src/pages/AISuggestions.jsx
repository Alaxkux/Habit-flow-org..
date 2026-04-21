import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import { Sparkles, Plus, RefreshCw } from 'lucide-react'

const GOAL_PRESETS = [
  'Get healthier and fitter',
  'Be more productive at work',
  'Reduce stress and anxiety',
  'Learn new skills faster',
  'Improve my sleep quality',
  'Build better social habits',
]

const AISuggestions = () => {
  const [goals, setGoals] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(null)
  const [existingHabits, setExistingHabits] = useState([])

  useEffect(() => {
    api.get('/habits').then(r => setExistingHabits(r.data.map(h => h.name))).catch(() => {})
  }, [])

  const getSuggestions = async () => {
    if (!goals.trim()) return toast.error('Tell me your goals first!')
    setLoading(true)
    setSuggestions([])
    try {
      const res = await api.post('/ai/suggestions', { goals, existingHabits })
      setSuggestions(res.data.suggestions)
      toast.success('AI suggestions ready! 🤖')
    } catch {
      toast.error('Failed to get suggestions')
    } finally {
      setLoading(false)
    }
  }

  const addHabit = async (s) => {
    setAdding(s.name)
    try {
      await api.post('/habits', {
        name: s.name, category: s.category,
        color: s.color, frequency: s.frequency, icon: s.icon
      })
      toast.success(`"${s.name}" added! 🌱`)
    } catch { toast.error('Failed to add habit') }
    finally { setAdding(null) }
  }

  return (
    <div className="min-h-screen bg-green-50 pb-24 md:pb-8 md:ml-64">
      <Navbar title="AI Suggestions" />

      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="hidden md:flex items-center gap-2 mb-1">
          <Sparkles size={22} className="text-green-600" />
          <h1 className="font-display font-900 text-2xl text-gray-900">AI Suggestions</h1>
        </div>
        <p className="text-sm text-gray-400 mb-5">Tell Claude your goals and get personalized habit recommendations.</p>

        {/* Goal input */}
        <div className="bg-white rounded-3xl p-5 shadow-card mb-4">
          <label className="text-xs font-display font-700 text-gray-500 mb-2 block">WHAT DO YOU WANT TO ACHIEVE?</label>
          <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={3}
            placeholder="e.g. I want to get healthier, sleep better, and be more productive..."
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm resize-none focus:outline-none focus:border-green-400 focus:bg-white transition-all"/>

          {/* Presets */}
          <div className="flex flex-wrap gap-2 mt-3">
            {GOAL_PRESETS.map(p => (
              <button key={p} onClick={() => setGoals(p)}
                className="text-xs px-3 py-1.5 rounded-xl bg-green-50 text-green-700 font-600 hover:bg-green-100 transition-all border border-green-100">
                {p}
              </button>
            ))}
          </div>

          <button onClick={getSuggestions} disabled={loading || !goals.trim()}
            className="mt-4 w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 active:scale-95 text-white font-display font-800 flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md">
            {loading
              ? <><RefreshCw size={18} className="animate-spin"/> Generating...</>
              : <><Sparkles size={18}/> Get AI Suggestions</>}
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-card animate-pulse">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100"/>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2"/>
                    <div className="h-3 bg-gray-100 rounded-full w-1/2"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <h2 className="font-display font-800 text-gray-900 mb-3">Recommended for you ✨</h2>
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-card flex items-start gap-3"
                  style={{ borderLeft: `4px solid ${s.color}` }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: s.color + '20' }}>
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-800 text-gray-900 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{s.category} · {s.frequency}</p>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{s.reason}</p>
                  </div>
                  <button onClick={() => addHabit(s)} disabled={adding === s.name}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-green-100 hover:bg-green-500 text-green-600 hover:text-white flex items-center justify-center transition-all">
                    {adding === s.name
                      ? <RefreshCw size={16} className="animate-spin"/>
                      : <Plus size={18}/>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AISuggestions
