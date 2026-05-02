import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, CheckSquare, TrendingUp, Award, Sparkles, ShoppingBag, Settings, LogOut, Zap } from 'lucide-react'
import api from '../../api/axios'
import { useState, useEffect } from 'react'

const navItems = [
  { to:'/dashboard', icon:LayoutDashboard, label:'Dashboard' },
  { to:'/habits',    icon:CheckSquare,     label:'Habits'    },
  { to:'/progress',  icon:TrendingUp,      label:'Progress'  },
  { to:'/badges',    icon:Award,           label:'Badges'    },
  { to:'/ai',        icon:Sparkles,        label:'AI'        },
  { to:'/xp-store',  icon:ShoppingBag,     label:'Store'     },
  { to:'/settings',  icon:Settings,        label:'Settings'  },
]

const LEVELS = [
  { level:1,title:'Seedling',minXP:0 },   { level:2,title:'Sprout',minXP:100 },
  { level:3,title:'Grower',minXP:250 },   { level:4,title:'Hustler',minXP:500 },
  { level:5,title:'Consistent',minXP:800},{ level:6,title:'Dedicated',minXP:1200 },
  { level:7,title:'Disciplined',minXP:1700},{ level:8,title:'Master',minXP:2300 },
  { level:9,title:'Champion',minXP:3000 },{ level:10,title:'Legend',minXP:4000 },
]
const LEVEL_EMOJI = ['','🌱','🌿','💪','🏃','⚡','🎯','🔥','💎','👑','🏆']

const getLevelInfo = (xp=0) => {
  let cur = LEVELS[0], nxt = LEVELS[1]
  for (let i = LEVELS.length-1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) { cur=LEVELS[i]; nxt=LEVELS[i+1]||null; break }
  }
  const progressXP = xp - cur.minXP
  const neededXP   = nxt ? nxt.minXP - cur.minXP : 1
  return { ...cur, xp, progressXP, neededXP, pct: nxt ? Math.min(100,Math.round((progressXP/neededXP)*100)) : 100 }
}

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [lvl, setLvl] = useState(null)

  useEffect(() => {
    api.get('/logs/xp').then(r => setLvl(r.data)).catch(() => {})
    const t = setInterval(() => api.get('/logs/xp').then(r => setLvl(r.data)).catch(() => {}), 30000)
    return () => clearInterval(t)
  }, [])

  const li = lvl ? getLevelInfo(lvl.xp) : null

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-72 min-h-screen fixed left-0 top-0 z-30"
        style={{ backgroundColor:'var(--color-sidebar)', borderRight:'1px solid var(--color-border)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom:'1px solid var(--color-border)' }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-display font-900 text-xl shadow-md"
            style={{ backgroundColor:'var(--color-accent)' }}>H</div>
          <div>
            <span className="font-display font-900 text-xl theme-text tracking-tight">HabitFlow</span>
            <p className="text-[10px] theme-sub font-600">Build habits that stick</p>
          </div>
        </div>

        {/* XP panel */}
        {li && (
          <div className="mx-4 mt-4 rounded-2xl p-4"
            style={{ backgroundColor:'var(--color-accent-light)', border:'1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{LEVEL_EMOJI[li.level]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-display font-800 text-sm theme-text truncate">Lv.{li.level} — {li.title}</p>
                <p className="text-[10px] font-600 flex items-center gap-0.5" style={{ color:'var(--color-accent)' }}>
                  <Zap size={9}/>{li.xp} XP total
                </p>
              </div>
              <span className="text-xs font-display font-900" style={{ color:'var(--color-accent)' }}>{li.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor:'var(--color-border)' }}>
              <div className="h-full rounded-full transition-all duration-700 xp-bar-fill"
                style={{ width:`${li.pct}%`, backgroundColor:'var(--color-accent)' }}/>
            </div>
            {li.pct < 100 && (
              <p className="text-[9px] theme-sub mt-1 text-right font-600">{li.progressXP}/{li.neededXP} XP to next</p>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon:Icon, label }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl font-display font-700 text-sm transition-all cursor-pointer"
                  style={isActive
                    ? { backgroundColor:'var(--color-accent)', color:'#fff' }
                    : { color:'var(--color-sub-text)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={isActive
                      ? { backgroundColor:'rgba(255,255,255,0.2)' }
                      : { backgroundColor:'var(--color-accent-light)' }}>
                    <Icon size={17}/>
                  </div>
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4" style={{ borderTop:'1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-800 text-white flex-shrink-0 shadow-sm"
              style={{ backgroundColor:'var(--color-accent)' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-700 theme-text truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs theme-sub truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-2xl text-sm font-700 text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={16}/> Log out
          </button>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md"
        style={{ backgroundColor:'var(--color-nav-bg)', borderTop:'1px solid var(--color-border)' }}>
        <div className="flex items-center justify-around h-14 px-1">
          {navItems.map(({ to, icon:Icon, label }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <div className="flex flex-col items-center justify-center gap-0.5 flex-1 h-14 transition-all cursor-pointer"
                  style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-sub-text)' }}>
                  <div className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                    style={isActive ? { backgroundColor:'var(--color-accent-light)' } : {}}>
                    <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8}/>
                  </div>
                  <span className="text-[9px] font-display font-700 leading-none">{label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}

export default Sidebar
