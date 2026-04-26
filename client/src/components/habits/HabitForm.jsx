import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import { Clock, Target } from 'lucide-react'

const CATEGORIES = ['health','fitness','mindfulness','learning','productivity','social','other']
const ICONS = ['✅','💪','🧘','📚','⚡','💧','🏃','🎯','🌿','😴','✍️','🎨','🍎','🧠','🌅','🎵','🖥️','🧹','💊','🧴']
const COLORS = ['#4CAF50','#EF5350','#FF7043','#AB47BC','#42A5F5','#FFA726','#26C6DA','#EC407A','#66BB6A','#795548']
const FREQUENCIES = [
  { value:'daily',    label:'Every day' },
  { value:'weekdays', label:'Weekdays' },
  { value:'weekends', label:'Weekends' },
  { value:'weekly',   label:'Once a week' },
]
const GOAL_TYPES = [
  { value:'daily',   label:'Daily',    desc:'Track per day',   emoji:'📅' },
  { value:'weekly',  label:'Weekly',   desc:'Track per week',  emoji:'🗓️' },
  { value:'monthly', label:'Monthly',  desc:'Track per month', emoji:'📆' },
  { value:'once',    label:'One-time', desc:'Done once & tick',emoji:'🎯' },
]
const DEFAULT = { name:'', category:'other', color:'#4CAF50', frequency:'daily', icon:'✅', reminderTime:'', goalType:'daily', goalTarget:1 }

const HabitForm = ({ isOpen, onClose, onSubmit, initial }) => {
  const [form, setForm] = useState(DEFAULT)
  const [showTime, setShowTime] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (initial) { setForm({ ...DEFAULT, ...initial }); setShowTime(!!initial.reminderTime) }
    else { setForm(DEFAULT); setShowTime(false) }
  }, [initial, isOpen])

  const handleSubmit = () => {
    if (!form.name.trim()) return
    onSubmit({ ...form, reminderTime: showTime ? form.reminderTime : '' })
    onClose()
  }

  const ic = "w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-all"
  const lc = "text-xs font-display font-700 text-gray-500 mb-2 block"

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Habit' : 'New Habit'}>
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className={lc}>HABIT NAME</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Morning run" maxLength={50} className={ic}/>
        </div>

        {/* Icon */}
        <div>
          <label className={lc}>ICON</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(ic => (
              <button key={ic} type="button" onClick={() => set('icon', ic)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all
                  ${form.icon===ic ? 'bg-green-100 ring-2 ring-green-500 scale-110' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className={lc}>COLOR</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => set('color', c)} style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-full transition-all ${form.color===c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}/>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className={lc}>CATEGORY</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} className={ic}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
        </div>

        {/* Frequency */}
        <div>
          <label className={lc}>FREQUENCY</label>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map(f => (
              <button key={f.value} type="button" onClick={() => set('frequency', f.value)}
                className={`py-2.5 rounded-2xl text-sm font-display font-700 transition-all
                  ${form.frequency===f.value ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Goal Type — 2x2 grid */}
        <div>
          <label className={lc}><Target size={11} className="inline mr-1"/>GOAL TYPE</label>
          <div className="grid grid-cols-2 gap-2">
            {GOAL_TYPES.map(g => (
              <button key={g.value} type="button" onClick={() => set('goalType', g.value)}
                className={`py-3 px-3 rounded-2xl text-left transition-all border-2
                  ${form.goalType===g.value ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-gray-50 hover:border-green-200'}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base">{g.emoji}</span>
                  <p className={`text-sm font-display font-800 ${form.goalType===g.value ? 'text-green-700' : 'text-gray-700'}`}>{g.label}</p>
                </div>
                <p className="text-[10px] text-gray-400">{g.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Optional reminder time */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-display font-700 text-gray-500 flex items-center gap-1">
              <Clock size={11}/> REMINDER TIME <span className="text-gray-300 ml-1">(optional)</span>
            </label>
            <button type="button" onClick={() => { setShowTime(v=>!v); if(showTime) set('reminderTime','') }}
              className={`text-[11px] font-display font-700 px-2.5 py-1 rounded-lg transition-all
                ${showTime ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-green-50'}`}>
              {showTime ? 'Remove' : '+ Add time'}
            </button>
          </div>
          {showTime && (
            <input type="time" value={form.reminderTime} onChange={e => set('reminderTime', e.target.value)} className={ic}/>
          )}
          {showTime && form.reminderTime && (
            <p className="text-[10px] text-green-600 mt-1 font-600">⏰ Habits with times will appear first in your list</p>
          )}
        </div>

        <button type="button" onClick={handleSubmit} disabled={!form.name.trim()}
          className="w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-display font-800 transition-all disabled:opacity-50">
          {initial ? 'Save Changes' : 'Create Habit'}
        </button>
      </div>
    </Modal>
  )
}

export default HabitForm
