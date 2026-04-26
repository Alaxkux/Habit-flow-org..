import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, CheckSquare, TrendingUp, Award, Sparkles, Settings, LogOut, ShoppingBag } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits',    icon: CheckSquare,     label: 'Habits' },
  { to: '/progress',  icon: TrendingUp,      label: 'Progress' },
  { to: '/badges',    icon: Award,           label: 'Badges' },
  { to: '/ai',        icon: Sparkles,        label: 'AI' },
  { to: '/xp-store',  icon: ShoppingBag,     label: 'Store' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 px-4 py-6 fixed left-0 top-0 z-30">
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center text-white font-display font-900 text-lg shadow-md">H</div>
          <span className="font-display font-900 text-xl text-gray-900 tracking-tight">HabitFlow</span>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-display font-700 text-sm transition-all
              ${isActive ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 hover:bg-green-50 hover:text-green-700'}`}>
              <Icon size={20}/>{label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center font-display font-800 text-green-700 text-sm flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-700 text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-sm font-700 text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={18}/> Log out
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-pb">
        <div className="flex items-center justify-around h-14">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all
              ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isActive ? 'bg-green-100' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8}/>
                  </div>
                  <span className="text-[9px] font-display font-700 leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}

export default Sidebar
