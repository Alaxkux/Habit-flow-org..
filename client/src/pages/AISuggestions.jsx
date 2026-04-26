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
  const [added, setAdded] = useState(new Set())
  const [existingHabits, setExistingHabits] = useState([])

  useEffect(() => {
    api.get('/habits').then(r => setExistingHabits(r.data.map(h => h.name))).catch(() => {})
  }, [])

  const getSuggestions = async () => {
    if (!goals.trim()) return toast.error('Share your goals first!')
    setLoading(true)
    setSuggestions([])
    setAdded(new Set())
    try {
      const res = await api.post('/ai/suggestions', { goals, existingHabits })
      setSuggestions(res.data.suggestions)
      toast.success('Personalized habits ready! ✨')
    } catch {
      toast.error('Failed to get suggestions')
    } finally { setLoading(false) }
  }

  const addHabit = async (s) => {
    setAdding(s.name)
    try {
      await api.post('/habits', { name:s.name, category:s.category, color:s.color, frequency:s.frequency, icon:s.icon })
      toast.success(`"${s.name}" added! 🌱`)
      setAdded(prev => new Set([...prev, s.name]))
    } catch { toast.error('Failed to add habit') }
    finally { setAdding(null) }
  }

  return (
    <div className="min-h-screen bg-green-50 pb-28 md:pb-8 md:ml-64 overflow-x-hidden">
      <Navbar title="AI Suggestions"/>
      <div className="h-14 md:hidden"/>

      <div className="px-4 py-4 md:px-8 md:py-8 max-w-2xl mx-auto w-full">

        <div className="hidden md:flex items-center gap-2 mb-1">
          <Sparkles size={22} className="text-green-600"/>
          <h1 className="font-display font-900 text-2xl text-gray-900">AI Suggestions</h1>
        </div>
        <p className="text-sm text-gray-400 mb-5">Tell us your goals and get personalized habit recommendations built just for you.</p>

        {/* Input card */}
        <div className="bg-white rounded-3xl p-5 shadow-card mb-5">
          <label className="text-xs font-display font-700 text-gray-500 mb-2 block">WHAT DO YOU WANT TO ACHIEVE?</label>
          <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={3}
            placeholder="e.g. I want to get healthier, sleep better, and be more productive..."
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm resize-none focus:outline-none focus:border-green-400 focus:bg-white transition-all"/>

          <div className="flex flex-wrap gap-2 mt-3">
            {GOAL_PRESETS.map(p => (
              <button key={p} onClick={() => setGoals(p)}
                className={`text-xs px-3 py-1.5 rounded-xl font-600 transition-all border
                  ${goals===p ? 'bg-green-500 text-white border-green-500' : 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'}`}>
                {p}
              </button>
            ))}
          </div>

          <button onClick={getSuggestions} disabled={loading || !goals.trim()}
            className="mt-4 w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 active:scale-95 text-white font-display font-800 flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md">
            {loading
              ? <><RefreshCw size={18} className="animate-spin"/> Generating...</>
              : <><Sparkles size={18}/> Get Suggestions</>}
          </button>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-card animate-pulse">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 mb-3"/>
                <div className="h-3.5 bg-gray-100 rounded-full w-3/4 mb-2"/>
                <div className="h-3 bg-gray-100 rounded-full w-1/2 mb-3"/>
                <div className="h-8 bg-gray-100 rounded-xl"/>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions Grid */}
        {suggestions.length > 0 && (
          <div>
            <h2 className="font-display font-800 text-gray-900 mb-3 flex items-center gap-2">
              <span>Recommended for you</span>
              <span className="text-xs bg-green-100 text-green-700 font-700 px-2 py-0.5 rounded-full">{suggestions.length}</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {suggestions.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-card flex flex-col border-t-4"
                  style={{ borderTopColor: s.color }}>
                  {/* Icon + Name */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: s.color + '20' }}>
                      {s.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-800 text-gray-900 text-sm leading-tight">{s.name}</p>
                      <p className="text-[10px] text-gray-400 capitalize mt-0.5">{s.category} · {s.frequency}</p>
                    </div>
                  </div>

                  {/* Reason */}
                  <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-3">{s.reason}</p>

                  {/* Add button */}
                  <button onClick={() => addHabit(s)} disabled={adding===s.name || added.has(s.name)}
                    className={`w-full py-2 rounded-xl font-display font-800 text-xs flex items-center justify-center gap-1.5 transition-all
                      ${added.has(s.name)
                        ? 'bg-green-50 text-green-600 cursor-default'
                        : 'bg-green-500 hover:bg-green-600 text-white active:scale-95'}`}>
                    {adding===s.name
                      ? <RefreshCw size={13} className="animate-spin"/>
                      : added.has(s.name)
                        ? <>✓ Added</>
                        : <><Plus size={13}/> Add Habit</>}
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
