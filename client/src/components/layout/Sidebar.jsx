import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, CheckSquare, TrendingUp, Award,
  Sparkles, ShoppingBag, Settings, LogOut, Zap, Target
} from 'lucide-react'
import api from '../../api/axios'
import { useState, useEffect } from 'react'

const navItems = [
  { to:'/dashboard', icon:LayoutDashboard, label:'Dashboard' },
  { to:'/habits',    icon:CheckSquare,     label:'Habits' },
  { to:'/progress',  icon:TrendingUp,      label:'Progress' },
  { to:'/badges',    icon:Award,           label:'Badges' },
  { to:'/ai',        icon:Sparkles,        label:'AI' },
  { to:'/xp-store',  icon:ShoppingBag,     label:'Store' },
  { to:'/settings',  icon:Settings,        label:'Settings' },
]

const LEVELS = [
  { level:1,title:'Seedling',minXP:0 }, { level:2,title:'Sprout',minXP:100 },
  { level:3,title:'Grower',minXP:250 }, { level:4,title:'Hustler',minXP:500 },
  { level:5,title:'Consistent',minXP:800 }, { level:6,title:'Dedicated',minXP:1200 },
  { level:7,title:'Disciplined',minXP:1700 }, { level:8,title:'Master',minXP:2300 },
  { level:9,title:'Champion',minXP:3000 }, { level:10,title:'Legend',minXP:4000 },
]
const LEVEL_EMOJI = ['','🌱','🌿','💪','🏃','⚡','🎯','🔥','💎','👑','🏆']

const getLevelInfo = (xp=0) => {
  let cur = LEVELS[0], nxt = LEVELS[1]
  for (let i = LEVELS.length-1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) { cur=LEVELS[i]; nxt=LEVELS[i+1]||null; break }
  }
  const prog = xp - cur.minXP
  const need = nxt ? nxt.minXP - cur.minXP : 1
  return { ...cur, xp, progressXP: prog, neededXP: need, pct: nxt ? Math.min(100,Math.round((prog/need)*100)) : 100 }
}

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [lvl, setLvl] = useState(null)

  useEffect(() => {
    api.get('/logs/xp').then(r => setLvl(r.data)).catch(() => {})
    // refresh every 30s so XP stays current without full reload
    const t = setInterval(() => {
      api.get('/logs/xp').then(r => setLvl(r.data)).catch(() => {})
    }, 30000)
    return () => clearInterval(t)
  }, [])

  const li = lvl ? getLevelInfo(lvl.xp) : null

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-72 min-h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-30">

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-50">
          <div className="w-10 h-10 rounded-2xl bg-green-500 flex items-center justify-center text-white font-display font-900 text-xl shadow-md">H</div>
          <div>
            <span className="font-display font-900 text-xl text-gray-900 tracking-tight">HabitFlow</span>
            <p className="text-[10px] text-gray-400 font-600">Build habits that stick</p>
          </div>
        </div>

        {/* XP panel */}
        {li && (
          <div className="mx-4 mt-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{LEVEL_EMOJI[li.level]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-display font-800 text-gray-900 text-sm truncate">Lv.{li.level} — {li.title}</p>
                <p className="text-[10px] text-amber-600 font-600 flex items-center gap-0.5"><Zap size={9}/>{li.xp} XP total</p>
              </div>
              <span className="text-xs font-display font-900 text-amber-500">{li.pct}%</span>
            </div>
            <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width:`${li.pct}%`, background:'linear-gradient(90deg,#F59E0B,#FBBF24)' }}/>
            </div>
            {li.neededXP && li.pct < 100 && (
              <p className="text-[9px] text-amber-400 mt-1 text-right font-600">{li.progressXP}/{li.neededXP} XP to next level</p>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon:Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-display font-700 text-sm transition-all group
              ${isActive
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-500 hover:bg-green-50 hover:text-green-700'}`}>
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                    ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-green-100'}`}>
                    <Icon size={17}/>
                  </div>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Today's quick stats */}
        <div className="mx-4 mb-4 bg-green-50 rounded-2xl p-3">
          <p className="text-[10px] font-display font-700 text-green-700 mb-2 uppercase tracking-wide">Quick Stats</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon:'🎯', label:'Habits', val: '—' },
              { icon:'🔥', label:'Streak', val: '—' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-2 text-center">
                <p className="text-base">{s.icon}</p>
                <p className="font-display font-900 text-gray-900 text-sm">{s.val}</p>
                <p className="text-[9px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* User footer */}
        <div className="border-t border-gray-100 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center font-display font-800 text-white flex-shrink-0 shadow-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-700 text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-2xl text-sm font-700 text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={16}/> Log out
          </button>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100">
        <div className="flex items-center justify-around h-14 px-1">
          {navItems.map(({ to, icon:Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all
              ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isActive ? 'bg-green-100' : ''}`}>
                    <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8}/>
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
