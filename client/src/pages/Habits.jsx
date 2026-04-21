import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import HabitCard from '../components/habits/HabitCard'
import HabitForm from '../components/habits/HabitForm'
import { Plus } from 'lucide-react'

const Habits = () => {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/habits')
      setHabits(res.data)
    } catch { toast.error('Failed to load habits') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleCreate = async (form) => {
    try {
      const res = await api.post('/habits', form)
      setHabits(prev => [res.data, ...prev])
      toast.success('Habit created! 🌱')
    } catch { toast.error('Failed to create habit') }
  }

  const handleUpdate = async (form) => {
    try {
      const res = await api.put(`/habits/${editing._id}`, form)
      setHabits(prev => prev.map(h => h._id === editing._id ? res.data : h))
      toast.success('Habit updated!')
      setEditing(null)
    } catch { toast.error('Failed to update habit') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this habit?')) return
    try {
      await api.delete(`/habits/${id}`)
      setHabits(prev => prev.filter(h => h._id !== id))
      toast.success('Habit deleted')
    } catch { toast.error('Failed to delete') }
  }

  const openEdit = (habit) => { setEditing(habit); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  return (
    <div className="min-h-screen bg-green-50 pb-24 md:pb-8 md:ml-64">
      <Navbar title="My Habits" />

      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display font-900 text-2xl text-gray-900 hidden md:block">My Habits</h1>
            <p className="text-sm text-gray-400">{habits.length} habit{habits.length !== 1 ? 's' : ''} total</p>
          </div>
          <button onClick={() => { setEditing(null); setModalOpen(true) }}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white px-4 py-2.5 rounded-2xl font-display font-800 text-sm transition-all shadow-md">
            <Plus size={18}/> New Habit
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : habits.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-card">
            <div className="text-5xl mb-4">🎯</div>
            <p className="font-display font-800 text-gray-700 text-lg">No habits yet</p>
            <p className="text-sm text-gray-400 mb-5">Create your first habit to get started</p>
            <button onClick={() => setModalOpen(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-2xl font-display font-800 hover:bg-green-600 transition-all">
              Create Habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map(habit => (
              <HabitCard key={habit._id} habit={habit}
                completed={false} showActions
                onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <HabitForm isOpen={modalOpen} onClose={closeModal}
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing} />
    </div>
  )
}

export default Habits
