import { useState, useEffect } from 'react'
import { X, Clock, ChevronDown } from 'lucide-react'

const CATEGORIES = ['health','fitness','mindfulness','learning','productivity','social','other']
const ICONS = ['✅','💪','🧘','📚','⚡','💧','🏃','🎯','🌿','😴','✍️','🎨','🍎','🧠','🌅','🎵','🖥️','🧹','💊','🧴']
const COLORS = ['#4CAF50','#EF5350','#FF7043','#AB47BC','#42A5F5','#FFA726','#26C6DA','#EC407A','#66BB6A','#795548']

// Synced: frequency drives goal type options
const SCHEDULE_OPTIONS = [
  {
    value: 'daily',
    label: 'Daily',
    emoji: '📅',
    desc: 'Every day',
    goalType: 'daily',
  },
  {
    value: 'weekdays',
    label: 'Weekdays',
    emoji: '💼',
    desc: 'Mon – Fri',
    goalType: 'daily',
  },
  {
    value: 'weekends',
    label: 'Weekends',
    emoji: '🌅',
    desc: 'Sat & Sun',
    goalType: 'daily',
  },
  {
    value: 'weekly',
    label: 'Weekly',
    emoji: '🗓️',
    desc: 'Once a week',
    goalType: 'weekly',
  },
  {
    value: 'monthly',
    label: 'Monthly',
    emoji: '📆',
    desc: 'Once a month',
    goalType: 'monthly',
  },
  {
    value: 'once',
    label: 'One-time',
    emoji: '🎯',
    desc: 'Do it once',
    goalType: 'once',
  },
]

const DEFAULT = { name:'', category:'other', color:'#4CAF50', frequency:'daily', icon:'✅', reminderTime:'', goalType:'daily' }

const HabitForm = ({ isOpen, onClose, onSubmit, initial }) => {
  const [form, setForm] = useState(DEFAULT)
  const [showTime, setShowTime] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        setForm({ ...DEFAULT, ...initial })
        setShowTime(!!initial.reminderTime)
      } else {
        setForm(DEFAULT)
        setShowTime(false)
      }
    }
  }, [initial, isOpen])

  // Sync goalType when frequency changes
  const handleSchedule = (opt) => {
    setForm(f => ({ ...f, frequency: opt.value, goalType: opt.goalType }))
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return
    onSubmit({ ...form, reminderTime: showTime ? form.reminderTime : '' })
    onClose()
  }

  if (!isOpen) return null

  const ic = "w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-all"
  const lc = "text-[11px] font-display font-700 text-gray-400 uppercase tracking-wide mb-2 block"

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>

      {/* Sheet: 2/3 screen height on mobile, centered modal on desktop */}
      <div className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl flex flex-col"
        style={{ height: '67vh', maxHeight: '67vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Fixed header with close button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-white rounded-t-3xl md:rounded-t-3xl z-10">
          <h3 className="font-display font-800 text-lg text-gray-900">{initial ? 'Edit Habit' : 'New Habit'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all">
            <X size={16} className="text-gray-500"/>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Name */}
          <div>
            <label className={lc}>Habit Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Morning run" maxLength={50} className={ic}/>
          </div>

          {/* Icon */}
          <div>
            <label className={lc}>Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ico => (
                <button key={ico} type="button" onClick={() => set('icon', ico)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all
                    ${form.icon===ico ? 'bg-green-100 ring-2 ring-green-500 scale-110' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {ico}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className={lc}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full transition-all ${form.color===c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}/>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={lc}>Category</label>
            <div className="relative">
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className={ic + ' appearance-none pr-10'}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>
          </div>

          {/* Schedule (frequency + goal type synced) */}
          <div>
            <label className={lc}>Schedule & Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {SCHEDULE_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => handleSchedule(opt)}
                  className={`py-3 px-2 rounded-2xl text-center transition-all border-2
                    ${form.frequency===opt.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-100 bg-gray-50 hover:border-green-200'}`}>
                  <div className="text-lg mb-0.5">{opt.emoji}</div>
                  <p className={`text-xs font-display font-800 leading-tight ${form.frequency===opt.value ? 'text-green-700' : 'text-gray-700'}`}>{opt.label}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Optional reminder time */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={lc + ' mb-0 flex items-center gap-1'}>
                <Clock size={10}/> Reminder Time <span className="text-gray-300 normal-case">(optional)</span>
              </label>
              <button type="button"
                onClick={() => { setShowTime(v=>!v); if(showTime) set('reminderTime','') }}
                className={`text-[11px] font-display font-700 px-2.5 py-1 rounded-lg transition-all
                  ${showTime ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-green-50'}`}>
                {showTime ? 'Remove' : '+ Add time'}
              </button>
            </div>
            {showTime && (
              <>
                <input type="time" value={form.reminderTime} onChange={e => set('reminderTime', e.target.value)} className={ic}/>
                {form.reminderTime && (
                  <p className="text-[10px] text-green-600 mt-1 font-600">⏰ This habit will appear first in your list</p>
                )}
              </>
            )}
          </div>

          {/* Bottom padding so content clears the submit button */}
          <div className="h-4"/>
        </div>

        {/* Fixed submit button at bottom */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
          <button type="button" onClick={handleSubmit} disabled={!form.name.trim()}
            className="w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-display font-800 text-base transition-all disabled:opacity-40 active:scale-[0.98]">
            {initial ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HabitForm
