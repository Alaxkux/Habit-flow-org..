import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import HabitCard from '../components/habits/HabitCard'
import HabitForm from '../components/habits/HabitForm'
import { Plus } from 'lucide-react'

const Habits = () => {
  const [habits,        setHabits]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editing,       setEditing]       = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchHabits = useCallback(async () => {
    try { const r = await api.get('/habits'); setHabits(r.data) }
    catch { toast.error('Failed to load habits') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const handleCreate = async (form) => {
    try { const r = await api.post('/habits', form); setHabits(p => [r.data, ...p]); toast.success('Habit created! 🌱') }
    catch { toast.error('Failed to create habit') }
  }

  const handleUpdate = async (form) => {
    try {
      const r = await api.put(`/habits/${editing._id}`, form)
      setHabits(p => p.map(h => h._id === editing._id ? r.data : h))
      toast.success('Habit updated!'); setEditing(null)
    } catch { toast.error('Failed to update habit') }
  }

  const confirmDelete = async () => {
    try { await api.delete(`/habits/${deleteConfirm}`); setHabits(p => p.filter(h => h._id !== deleteConfirm)); toast.success('Habit deleted') }
    catch { toast.error('Failed to delete') }
    finally { setDeleteConfirm(null) }
  }

  const openEdit  = (h) => { setEditing(h); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  return (
    <div className="min-h-screen theme-bg pb-28 md:pb-8 md:ml-72 overflow-x-hidden">
      <Navbar title="My Habits"/>
      <div className="h-14 md:hidden"/>
      <div className="px-4 py-4 md:px-8 md:py-8 max-w-2xl mx-auto w-full">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display font-900 text-2xl theme-text hidden md:block">My Habits</h1>
            <p className="text-sm theme-sub">{habits.length} habit{habits.length !== 1 ? 's' : ''} total</p>
          </div>
          <button onClick={() => { setEditing(null); setModalOpen(true) }}
            className="flex items-center gap-2 text-white px-4 py-2.5 rounded-2xl font-display font-800 text-sm transition-all shadow-md active:scale-95"
            style={{ backgroundColor:'var(--color-accent)' }}>
            <Plus size={18}/> New Habit
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor:'var(--color-accent)', borderTopColor:'transparent' }}/>
          </div>
        ) : habits.length === 0 ? (
          <div className="theme-card rounded-3xl p-10 text-center shadow-card">
            <div className="text-5xl mb-4">🎯</div>
            <p className="font-display font-800 theme-text text-lg">No habits yet</p>
            <p className="text-sm theme-sub mb-5">Create your first habit to get started</p>
            <button onClick={() => setModalOpen(true)}
              className="text-white px-6 py-3 rounded-2xl font-display font-800 transition-all"
              style={{ backgroundColor:'var(--color-accent)' }}>
              Create Habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map(h => (
              <HabitCard key={h._id} habit={h} completed={false} showActions onEdit={openEdit} onDelete={setDeleteConfirm}/>
            ))}
          </div>
        )}
      </div>

      <HabitForm isOpen={modalOpen} onClose={closeModal}
        onSubmit={editing ? handleUpdate : handleCreate} initial={editing}/>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="theme-card rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-3xl text-center mb-3">🗑️</div>
            <h3 className="font-display font-900 theme-text text-center text-lg mb-1">Delete Habit?</h3>
            <p className="text-sm theme-sub text-center mb-5">This will permanently delete this habit and all its history.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-2xl font-display font-800 text-sm transition-all"
                style={{ backgroundColor:'var(--color-bg)', color:'var(--color-page-text)' }}>
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-display font-800 text-sm hover:bg-red-600 transition-all">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Habits
