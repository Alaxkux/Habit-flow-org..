import { useAuth } from '../../context/AuthContext'
import { Bell } from 'lucide-react'

const Navbar = ({ title }) => {
  const { user } = useAuth()
  return (
    <header className="md:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div>
        <h1 className="font-display font-900 text-lg text-gray-900 leading-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-green-600">
          <Bell size={18} />
        </button>
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center font-display font-800 text-white text-sm">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
      </div>
    </header>
  )
}

export default Navbar
