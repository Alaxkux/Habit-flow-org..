import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Bell, Trash2, User, Settings, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, saveNotifications } from '../../utils/notifications'

const typeIcon = { streak:'🔥', badge:'🏅', tip:'💡', info:'📢', welcome:'👋', xp:'⚡' }

const Navbar = ({ title }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotifs,    setShowNotifs]    = useState(false)
  const [showProfile,   setShowProfile]   = useState(false)
  const [notifs,        setNotifs]        = useState(getNotifications)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const notifsRef  = useRef(null)
  const profileRef = useRef(null)
  const unreadCount = notifs.filter(n => !n.read).length

  useEffect(() => {
    const h = () => setNotifs(getNotifications())
    window.addEventListener('hf_notification', h)
    return () => window.removeEventListener('hf_notification', h)
  }, [])

  useEffect(() => {
    const h = (e) => {
      if (notifsRef.current  && !notifsRef.current.contains(e.target))  setShowNotifs(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const markAllRead = () => { const u = notifs.map(n=>({...n,read:true})); setNotifs(u); saveNotifications(u) }
  const deleteNotif = (id) => { const u = notifs.filter(n=>n.id!==id); setNotifs(u); saveNotifications(u) }
  const clearAll    = () => { setNotifs([]); saveNotifications([]) }
  const markRead    = (id) => { const u = notifs.map(n=>n.id===id?{...n,read:true}:n); setNotifs(u); saveNotifications(u) }
  const handleLogout = () => { logout(); navigate('/') }

  const dropdownStyle = {
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
  }

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 backdrop-blur-md h-14 flex items-center justify-between px-4"
        style={{ backgroundColor:'var(--color-nav-bg)', borderBottom:'1px solid var(--color-border)' }}>
        <h1 className="font-display font-900 text-lg theme-text truncate mr-2">{title}</h1>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Bell */}
          <div className="relative" ref={notifsRef}>
            <button onClick={() => { setShowNotifs(v=>!v); setShowProfile(false) }}
              className="w-9 h-9 rounded-full flex items-center justify-center relative"
              style={{ backgroundColor:'var(--color-accent-light)' }}>
              <Bell size={18} style={{ color:'var(--color-accent)' }}/>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-900 rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-12 z-50 rounded-2xl shadow-xl overflow-hidden"
                style={{ ...dropdownStyle, width:'min(320px, calc(100vw - 2rem))' }}>
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom:'1px solid var(--color-border)' }}>
                  <p className="font-display font-800 text-sm theme-text">Notifications</p>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[11px] font-700" style={{ color:'var(--color-accent)' }}>Mark all read</button>
                    )}
                    {notifs.length > 0 && (
                      <button onClick={clearAll} className="text-[11px] text-red-400 font-700">Clear all</button>
                    )}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y" style={{ borderColor:'var(--color-border)' }}>
                  {notifs.length === 0 ? (
                    <div className="py-8 text-center"><p className="text-2xl mb-1">🔔</p><p className="text-xs theme-sub font-600">All caught up!</p></div>
                  ) : notifs.map(n => (
                    <div key={n.id}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all"
                      style={{ backgroundColor: n.read ? 'var(--color-card)' : 'var(--color-accent-light)' }}
                      onClick={() => markRead(n.id)}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                        style={{ backgroundColor:'var(--color-bg)' }}>
                        {typeIcon[n.type]||'📢'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display font-800 theme-text">{n.title}</p>
                        <p className="text-[11px] theme-sub mt-0.5 leading-snug">{n.body}</p>
                        <p className="text-[10px] theme-sub mt-1 opacity-60">{n.time}</p>
                      </div>
                      <button onClick={e=>{e.stopPropagation();deleteNotif(n.id)}} className="flex-shrink-0 mt-1">
                        <Trash2 size={12} className="text-red-300 hover:text-red-500"/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => { setShowProfile(v=>!v); setShowNotifs(false) }}
              className="w-9 h-9 rounded-full flex items-center justify-center font-display font-800 text-white text-sm shadow-sm"
              style={{ backgroundColor:'var(--color-accent)' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </button>

            {showProfile && (
              <div className="absolute right-0 top-12 z-50 rounded-2xl shadow-xl overflow-hidden"
                style={{ ...dropdownStyle, width:'min(220px, calc(100vw - 2rem))' }}>
                <div className="px-4 py-3" style={{ borderBottom:'1px solid var(--color-border)' }}>
                  <p className="font-display font-800 text-sm theme-text truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs theme-sub truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  {[
                    { label:'Edit Profile', icon:<User size={14} className="theme-sub"/>, to:'/settings' },
                    { label:'XP Store ✨',  icon:<span className="text-sm">⚡</span>,        to:'/xp-store', gold:true },
                    { label:'Settings',     icon:<Settings size={14} className="theme-sub"/>, to:'/settings' },
                  ].map(({ label, icon, to, gold }) => (
                    <button key={label} onClick={() => { navigate(to); setShowProfile(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 transition-all"
                      style={{ color: gold ? 'var(--color-accent)' : 'var(--color-page-text)' }}>
                      {icon}
                      <span className="text-sm font-display font-700">{label}</span>
                    </button>
                  ))}
                  <div style={{ borderTop:'1px solid var(--color-border)', marginTop:4, paddingTop:4 }}>
                    <button onClick={() => { setShowProfile(false); setLogoutConfirm(true) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 transition-all hover:bg-red-50">
                      <LogOut size={14}/>
                      <span className="text-sm font-display font-700">Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout confirm */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            style={{ backgroundColor:'var(--color-card)' }}>
            <div className="text-3xl text-center mb-3">👋</div>
            <h3 className="font-display font-900 theme-text text-center text-lg mb-1">Log Out?</h3>
            <p className="text-sm theme-sub text-center mb-5">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button onClick={() => setLogoutConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-display font-800 text-sm transition-all"
                style={{ backgroundColor:'var(--color-bg)', color:'var(--color-page-text)' }}>
                Cancel
              </button>
              <button onClick={handleLogout}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-display font-800 text-sm hover:bg-red-600 transition-all">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
