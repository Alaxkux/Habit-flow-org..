import { useState } from 'react'
import { Check, MessageSquare, Clock, Target, X } from 'lucide-react'
import { FREQUENCY_LABELS } from '../../utils/helpers'

const GOAL_LABEL = { daily:'Daily', weekly:'Weekly', monthly:'Monthly', once:'One-time' }

const HabitCard = ({ habit, completed, onCheckIn, showActions, onEdit, onDelete, todayNote }) => {
  const [showNote, setShowNote] = useState(false)
  const [note,     setNote]     = useState('')
  const [checking, setChecking] = useState(false)

  const handleCheck = async () => {
    if (completed || checking) return
    setChecking(true)
    try { await onCheckIn(habit._id, '') } finally { setChecking(false) }
  }

  const handleNoteSubmit = async () => {
    if (completed || checking) return
    setChecking(true)
    try { await onCheckIn(habit._id, note.trim()); setShowNote(false); setNote('') } finally { setChecking(false) }
  }

  return (
    <div className="habit-card rounded-2xl border-l-4 overflow-hidden w-full transition-all shadow-card"
      style={{
        borderLeftColor: habit.color,
        backgroundColor: completed ? 'var(--color-accent-light)' : 'var(--color-card)',
      }}>

      <div className="flex items-center gap-3 p-3.5">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: habit.color + '22' }}>
          {habit.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-800 text-sm truncate"
            style={{ color: completed ? 'var(--color-sub-text)' : 'var(--color-page-text)',
                     textDecoration: completed ? 'line-through' : 'none' }}>
            {habit.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] theme-sub capitalize">{habit.category}</span>
            {habit.goalType && habit.goalType !== 'daily' && (
              <span className="text-[10px] font-700 px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
                style={{ backgroundColor:'var(--color-accent-light)', color:'var(--color-accent-text)' }}>
                <Target size={8}/>{GOAL_LABEL[habit.goalType]}
              </span>
            )}
            {habit.reminderTime && (
              <span className="text-[10px] font-600 px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
                style={{ backgroundColor:'var(--color-accent-light)', color:'var(--color-accent)' }}>
                <Clock size={8}/>{habit.reminderTime}
              </span>
            )}
          </div>
          {completed && todayNote && (
            <div className="flex items-center gap-1 mt-1">
              <MessageSquare size={9} className="flex-shrink-0" style={{ color:'var(--color-accent)' }}/>
              <p className="text-[10px] theme-sub italic truncate">{todayNote}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions ? (
          <div className="flex gap-1.5 flex-shrink-0">
            <button onClick={() => onEdit(habit)}
              className="text-xs px-2.5 py-1.5 rounded-xl font-700 transition-all"
              style={{ backgroundColor:'var(--color-accent-light)', color:'var(--color-accent-text)' }}>
              Edit
            </button>
            <button onClick={() => onDelete(habit._id)}
              className="text-xs px-2.5 py-1.5 rounded-xl font-700 transition-all bg-red-50 text-red-500 hover:bg-red-100">
              Delete
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!completed && (
              <button onClick={() => setShowNote(v => !v)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={showNote
                  ? { backgroundColor:'var(--color-accent-light)', color:'var(--color-accent)' }
                  : { color:'var(--color-sub-text)' }}>
                <MessageSquare size={14}/>
              </button>
            )}
            <button onClick={handleCheck} disabled={completed || checking}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={completed
                ? { backgroundColor:'var(--color-accent)', color:'#fff' }
                : checking
                  ? { backgroundColor:'var(--color-accent-light)', color:'var(--color-accent)' }
                  : { backgroundColor:'var(--color-bg)', color:'var(--color-sub-text)' }}>
              <Check size={20} strokeWidth={completed ? 3 : 2}/>
            </button>
          </div>
        )}
      </div>

      {/* Note panel */}
      {showNote && !completed && (
        <div className="px-3.5 pb-3.5 flex gap-2 items-center"
          style={{ borderTop:'1px solid var(--color-border)' }}>
          <input autoFocus value={note} onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter') handleNoteSubmit(); if(e.key==='Escape'){setShowNote(false);setNote('')} }}
            placeholder="Add a note, then check in..."
            maxLength={120}
            className="flex-1 min-w-0 text-xs px-3 py-2 rounded-xl focus:outline-none transition-all"
            style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-page-text)' }}/>
          <button onClick={handleNoteSubmit}
            className="flex-shrink-0 text-xs text-white px-3 py-2 rounded-xl font-700 transition-all"
            style={{ backgroundColor:'var(--color-accent)' }}>
            Done
          </button>
          <button onClick={() => { setShowNote(false); setNote('') }} className="flex-shrink-0">
            <X size={14} style={{ color:'var(--color-sub-text)' }}/>
          </button>
        </div>
      )}
    </div>
  )
}

export default HabitCard
