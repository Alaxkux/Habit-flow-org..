import { useState } from 'react'
import { Check, MessageSquare, Clock, Target, X } from 'lucide-react'
import { FREQUENCY_LABELS } from '../../utils/helpers'

const GOAL_LABEL = { daily:'Daily', weekly:'Weekly', monthly:'Monthly', once:'One-time' }

const HabitCard = ({ habit, completed, onCheckIn, showActions, onEdit, onDelete, todayNote }) => {
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')
  const [checking, setChecking] = useState(false)

  // Toggle: if completed already ignore. Otherwise check in immediately.
  const handleCheck = async () => {
    if (completed || checking) return
    setChecking(true)
    try {
      await onCheckIn(habit._id, '')
    } finally {
      setChecking(false)
    }
  }

  const handleNoteSubmit = async () => {
    if (completed || checking) return
    setChecking(true)
    try {
      await onCheckIn(habit._id, note.trim())
      setShowNote(false)
      setNote('')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className={`rounded-2xl border-l-4 overflow-hidden w-full transition-all
      ${completed ? 'bg-green-50' : 'bg-white hover:shadow-md'}`}
      style={{ borderLeftColor: habit.color }}>

      <div className="flex items-center gap-3 p-3.5">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: habit.color + '20' }}>
          {habit.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`font-display font-800 text-sm truncate ${completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {habit.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-gray-400 capitalize">{habit.category}</span>
            {habit.goalType && habit.goalType !== 'daily' && (
              <span className="text-[10px] bg-green-50 text-green-600 font-700 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <Target size={8}/>{GOAL_LABEL[habit.goalType]}
              </span>
            )}
            {/* Show reminder time on card */}
            {habit.reminderTime && (
              <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-600">
                <Clock size={8}/>{habit.reminderTime}
              </span>
            )}
          </div>
          {/* Show today's note if completed */}
          {completed && todayNote && (
            <div className="flex items-center gap-1 mt-1">
              <MessageSquare size={9} className="text-green-400 flex-shrink-0"/>
              <p className="text-[10px] text-gray-400 italic truncate">{todayNote}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions ? (
          <div className="flex gap-1.5 flex-shrink-0">
            <button onClick={() => onEdit(habit)} className="text-xs px-2.5 py-1.5 rounded-xl bg-gray-100 text-gray-600 font-700 hover:bg-gray-200 transition-all">Edit</button>
            <button onClick={() => onDelete(habit._id)} className="text-xs px-2.5 py-1.5 rounded-xl bg-red-50 text-red-500 font-700 hover:bg-red-100 transition-all">Delete</button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Note toggle — only when not completed */}
            {!completed && (
              <button onClick={() => setShowNote(v => !v)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all
                  ${showNote ? 'bg-green-100 text-green-600' : 'text-gray-300 hover:text-green-500 hover:bg-green-50'}`}>
                <MessageSquare size={14}/>
              </button>
            )}
            {/* Check button — toggle style, instant */}
            <button
              onClick={handleCheck}
              disabled={completed || checking}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                ${completed
                  ? 'bg-green-500 text-white cursor-default'
                  : checking
                    ? 'bg-green-200 text-green-600 cursor-wait'
                    : 'bg-gray-100 text-gray-400 hover:bg-green-500 hover:text-white active:scale-90'}`}>
              <Check size={20} strokeWidth={completed ? 3 : 2}/>
            </button>
          </div>
        )}
      </div>

      {/* Optional note panel */}
      {showNote && !completed && (
        <div className="px-3.5 pb-3.5 flex gap-2 items-center border-t border-gray-50">
          <input
            autoFocus
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleNoteSubmit()
              if (e.key === 'Escape') { setShowNote(false); setNote('') }
            }}
            placeholder="Add a note, then check in..."
            maxLength={120}
            className="flex-1 min-w-0 text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-green-400 transition-all"
          />
          <button onClick={handleNoteSubmit}
            className="flex-shrink-0 text-xs bg-green-500 text-white px-3 py-2 rounded-xl font-700 hover:bg-green-600 transition-all">
            Done
          </button>
          <button onClick={() => { setShowNote(false); setNote('') }} className="flex-shrink-0">
            <X size={14} className="text-gray-300 hover:text-gray-500"/>
          </button>
        </div>
      )}
    </div>
  )
}

export default HabitCard
