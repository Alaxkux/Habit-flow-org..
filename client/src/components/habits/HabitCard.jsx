import { Check } from 'lucide-react'
import { FREQUENCY_LABELS } from '../../utils/helpers'

const HabitCard = ({ habit, completed, onCheckIn, showActions, onEdit, onDelete }) => {
  return (
    <div className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
      ${completed ? 'border-transparent bg-green-50' : 'border-gray-100 bg-white hover:border-green-200'}`}
      style={{ borderLeftColor: habit.color, borderLeftWidth: 4 }}>

      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: habit.color + '20' }}>
        {habit.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-display font-800 text-sm truncate ${completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {habit.name}
        </p>
        <p className="text-xs text-gray-400 capitalize mt-0.5">{habit.category} · {FREQUENCY_LABELS[habit.frequency]}</p>
      </div>

      {/* Actions */}
      {showActions ? (
        <div className="flex gap-2">
          <button onClick={() => onEdit(habit)} className="text-xs px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 font-600 hover:bg-gray-200 transition-all">Edit</button>
          <button onClick={() => onDelete(habit._id)} className="text-xs px-3 py-1.5 rounded-xl bg-red-50 text-red-500 font-600 hover:bg-red-100 transition-all">Delete</button>
        </div>
      ) : (
        <button onClick={() => !completed && onCheckIn(habit._id)}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all flex-shrink-0
            ${completed
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-300 hover:bg-green-100 hover:text-green-500'}`}>
          <Check size={20} strokeWidth={3} />
        </button>
      )}
    </div>
  )
}

export default HabitCard
