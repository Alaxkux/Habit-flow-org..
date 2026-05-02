import { useState, useEffect } from 'react'
import { X, Clock, ChevronDown } from 'lucide-react'

const CATEGORIES = ['health','fitness','mindfulness','learning','productivity','social','other']
const ICONS = ['✅','💪','🧘','📚','⚡','💧','🏃','🎯','🌿','😴','✍️','🎨','🍎','🧠','🌅','🎵','🖥️','🧹','💊','🧴']
const COLORS = ['#4CAF50','#EF5350','#FF7043','#AB47BC','#42A5F5','#FFA726','#26C6DA','#EC407A','#66BB6A','#795548']

const SCHEDULE_OPTIONS = [
  { value:'daily',    label:'Daily',    emoji:'📅', desc:'Every day',     goalType:'daily'   },
  { value:'weekdays', label:'Weekdays', emoji:'💼', desc:'Mon – Fri',     goalType:'daily'   },
  { value:'weekends', label:'Weekends', emoji:'🌅', desc:'Sat & Sun',     goalType:'daily'   },
  { value:'weekly',   label:'Weekly',   emoji:'🗓️', desc:'Once a week',  goalType:'weekly'  },
  { value:'monthly',  label:'Monthly',  emoji:'📆', desc:'Once a month',  goalType:'monthly' },
  { value:'once',     label:'One-time', emoji:'🎯', desc:'Do it once',    goalType:'once'    },
]

const DEFAULT = { name:'', category:'other', color:'#4CAF50', frequency:'daily', icon:'✅', reminderTime:'', goalType:'daily' }

const HabitForm = ({ isOpen, onClose, onSubmit, initial }) => {
  const [form,     setForm]     = useState(DEFAULT)
  const [showTime, setShowTime] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (isOpen) {
      if (initial) { setForm({ ...DEFAULT, ...initial }); setShowTime(!!initial.reminderTime) }
      else         { setForm(DEFAULT); setShowTime(false) }
    }
  }, [initial, isOpen])

  const handleSchedule = (opt) => setForm(f => ({ ...f, frequency: opt.value, goalType: opt.goalType }))

  const handleSubmit = () => {
    if (!form.name.trim()) return
    onSubmit({ ...form, reminderTime: showTime ? form.reminderTime : '' })
    onClose()
  }

  if (!isOpen) return null

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-page-text)',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative w-full md:max-w-lg rounded-t-3xl md:rounded-3xl flex flex-col"
        style={{ height:'67vh', maxHeight:'67vh', backgroundColor:'var(--color-card)' }}
        onClick={e => e.stopPropagation()}>

        {/* Fixed header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 rounded-t-3xl md:rounded-t-3xl"
          style={{ borderBottom:'1px solid var(--color-border)', backgroundColor:'var(--color-card)' }}>
          <h3 className="font-display font-800 text-lg theme-text">{initial ? 'Edit Habit' : 'New Habit'}</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ backgroundColor:'var(--color-bg)' }}>
            <X size={16} style={{ color:'var(--color-sub-text)' }}/>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Name */}
          <div>
            <label className="text-[11px] font-display font-700 theme-sub uppercase tracking-wide mb-2 block">Habit Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Morning run" maxLength={50}
              className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none transition-all"
              style={inputStyle}/>
          </div>

          {/* Icon */}
          <div>
            <label className="text-[11px] font-display font-700 theme-sub uppercase tracking-wide mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ico => (
                <button key={ico} type="button" onClick={() => set('icon', ico)}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                  style={form.icon===ico
                    ? { backgroundColor:'var(--color-accent-light)', outline:'2px solid var(--color-accent)' }
                    : { backgroundColor:'var(--color-bg)' }}>
                  {ico}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-[11px] font-display font-700 theme-sub uppercase tracking-wide mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{ backgroundColor:c, outline: form.color===c ? '3px solid var(--color-page-text)' : 'none', outlineOffset:'2px' }}/>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] font-display font-700 theme-sub uppercase tracking-wide mb-2 block">Category</label>
            <div className="relative">
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none transition-all appearance-none pr-10"
                style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:'var(--color-sub-text)' }}/>
            </div>
          </div>

          {/* Schedule — synced with goal type */}
          <div>
            <label className="text-[11px] font-display font-700 theme-sub uppercase tracking-wide mb-2 block">Schedule & Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {SCHEDULE_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => handleSchedule(opt)}
                  className="py-3 px-2 rounded-2xl text-center transition-all"
                  style={form.frequency===opt.value
                    ? { border:'2px solid var(--color-accent)', backgroundColor:'var(--color-accent-light)' }
                    : { border:'2px solid var(--color-border)', backgroundColor:'var(--color-bg)' }}>
                  <div className="text-lg mb-0.5">{opt.emoji}</div>
                  <p className="text-xs font-display font-800 leading-tight"
                    style={{ color: form.frequency===opt.value ? 'var(--color-accent-text)' : 'var(--color-page-text)' }}>
                    {opt.label}
                  </p>
                  <p className="text-[9px] theme-sub mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Reminder time */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-display font-700 theme-sub uppercase tracking-wide flex items-center gap-1">
                <Clock size={10}/> Reminder Time <span className="normal-case opacity-50 ml-1">(optional)</span>
              </label>
              <button type="button"
                onClick={() => { setShowTime(v=>!v); if(showTime) set('reminderTime','') }}
                className="text-[11px] font-display font-700 px-2.5 py-1 rounded-lg transition-all"
                style={showTime
                  ? { backgroundColor:'var(--color-accent-light)', color:'var(--color-accent-text)' }
                  : { backgroundColor:'var(--color-bg)', color:'var(--color-sub-text)' }}>
                {showTime ? 'Remove' : '+ Add time'}
              </button>
            </div>
            {showTime && (
              <>
                <input type="time" value={form.reminderTime} onChange={e => set('reminderTime', e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none transition-all"
                  style={inputStyle}/>
                {form.reminderTime && (
                  <p className="text-[10px] mt-1 font-600" style={{ color:'var(--color-accent)' }}>
                    ⏰ This habit will appear first in your list
                  </p>
                )}
              </>
            )}
          </div>
          <div className="h-4"/>
        </div>

        {/* Fixed submit */}
        <div className="flex-shrink-0 px-5 py-4"
          style={{ borderTop:'1px solid var(--color-border)', backgroundColor:'var(--color-card)' }}>
          <button type="button" onClick={handleSubmit} disabled={!form.name.trim()}
            className="w-full py-3.5 rounded-2xl text-white font-display font-800 text-base transition-all disabled:opacity-40 active:scale-[0.98]"
            style={{ backgroundColor:'var(--color-accent)' }}>
            {initial ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HabitForm
