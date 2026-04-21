import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'

const CATEGORIES = ['health','fitness','mindfulness','learning','productivity','social','other']
const ICONS = ['✅','💪','🧘','📚','⚡','💧','🏃','🎯','🌿','😴','✍️','🎨','🍎','🧠','🌅']
const COLORS = ['#4CAF50','#EF5350','#FF7043','#AB47BC','#42A5F5','#FFA726','#26C6DA','#EC407A','#66BB6A','#FF7043']
const FREQUENCIES = [
  { value: 'daily',    label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'weekly',   label: 'Once a week' },
]

const HabitForm = ({ isOpen, onClose, onSubmit, initial }) => {
  const [form, setForm] = useState({ name: '', category: 'other', color: '#4CAF50', frequency: 'daily', icon: '✅' })

  useEffect(() => {
    if (initial) setForm(initial)
    else setForm({ name: '', category: 'other', color: '#4CAF50', frequency: 'daily', icon: '✅' })
  }, [initial, isOpen])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Habit' : 'New Habit'}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-display font-700 text-gray-500 mb-1 block">HABIT NAME</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Morning run" maxLength={50}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-all" />
        </div>

        <div>
          <label className="text-xs font-display font-700 text-gray-500 mb-2 block">ICON</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(ic => (
              <button key={ic} onClick={() => set('icon', ic)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all
                  ${form.icon === ic ? 'bg-green-100 ring-2 ring-green-500 scale-110' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-display font-700 text-gray-500 mb-2 block">COLOR</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`} />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-display font-700 text-gray-500 mb-1 block">CATEGORY</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-green-400 capitalize">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-display font-700 text-gray-500 mb-2 block">FREQUENCY</label>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map(f => (
              <button key={f.value} onClick={() => set('frequency', f.value)}
                className={`py-2.5 rounded-2xl text-sm font-display font-700 transition-all
                  ${form.frequency === f.value ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => { if (form.name.trim()) { onSubmit(form); onClose() } }}
          disabled={!form.name.trim()}
          className="w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-display font-800 transition-all disabled:opacity-50 mt-2">
          {initial ? 'Save Changes' : 'Create Habit'}
        </button>
      </div>
    </Modal>
  )
}

export default HabitForm
