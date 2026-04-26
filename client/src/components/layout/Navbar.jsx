import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Bell, Trash2, User, Settings, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, saveNotifications } from '../../utils/notifications'

const typeColor = { streak:'bg-orange-100 text-orange-500', badge:'bg-purple-100 text-purple-500', tip:'bg-blue-100 text-blue-500', info:'bg-blue-50 text-blue-400', welcome:'bg-green-100 text-green-600', xp:'bg-amber-100 text-amber-500' }
const typeIcon  = { streak:'🔥', badge:'🏅', tip:'💡', info:'📢', welcome:'👋', xp:'⚡' }

const Navbar = ({ title }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs]   = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifs, setNotifs]           = useState(getNotifications)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const notifsRef  = useRef(null)
  const profileRef = useRef(null)
  const unreadCount = notifs.filter(n => !n.read).length

  // Listen for new notifications pushed from anywhere in app
  useEffect(() => {
    const handler = () => setNotifs(getNotifications())
    window.addEventListener('hf_notification', handler)
    return () => window.removeEventListener('hf_notification', handler)
  }, [])

  // Close on outside click
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

  return (
    <>
      {/* Fixed top navbar mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 h-14 flex items-center justify-between px-4">
        <h1 className="font-display font-900 text-lg text-gray-900 truncate mr-2">{title}</h1>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Bell */}
          <div className="relative" ref={notifsRef}>
            <button onClick={() => { setShowNotifs(v=>!v); setShowProfile(false) }}
              className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-green-600 relative">
              <Bell size={18}/>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-900 rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                style={{ width:'min(320px, calc(100vw - 2rem))' }}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <p className="font-display font-800 text-sm text-gray-900">Notifications</p>
                  <div className="flex gap-2">
                    {unreadCount > 0 && <button onClick={markAllRead} className="text-[11px] text-green-600 font-700 hover:underline">Mark all read</button>}
                    {notifs.length > 0 && <button onClick={clearAll} className="text-[11px] text-red-400 font-700 hover:underline">Clear all</button>}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                  {notifs.length === 0 ? (
                    <div className="py-8 text-center"><p className="text-2xl mb-1">🔔</p><p className="text-xs text-gray-400 font-600">All caught up!</p></div>
                  ) : notifs.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 cursor-pointer ${n.read?'bg-white':'bg-green-50/50'}`} onClick={() => markRead(n.id)}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${typeColor[n.type]||'bg-gray-100 text-gray-400'}`}>
                        {typeIcon[n.type]||'📢'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-display font-800 ${n.read?'text-gray-500':'text-gray-900'}`}>{n.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{n.body}</p>
                        <p className="text-[10px] text-gray-300 mt-1">{n.time}</p>
                      </div>
                      <button onClick={e=>{e.stopPropagation();deleteNotif(n.id)}} className="flex-shrink-0 mt-1">
                        <Trash2 size={12} className="text-gray-300 hover:text-red-400"/>
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
              className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center font-display font-800 text-white text-sm shadow-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </button>

            {showProfile && (
              <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                style={{ width:'min(220px, calc(100vw - 2rem))' }}>
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="font-display font-800 text-sm text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  {[
                    { label:'Edit Profile', icon:<User size={14} className="text-gray-400"/>, to:'/settings' },
                    { label:'XP Store ✨',  icon:<span className="text-sm leading-none">⚡</span>, to:'/xp-store', gold:true },
                    { label:'Settings',     icon:<Settings size={14} className="text-gray-400"/>, to:'/settings' },
                  ].map(({ label, icon, to, gold }) => (
                    <button key={label} onClick={() => { navigate(to); setShowProfile(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-all">
                      {icon}
                      <span className={`text-sm font-display font-700 ${gold?'text-amber-500':'text-gray-700'}`}>{label}</span>
                    </button>
                  ))}
                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <button onClick={() => { setShowProfile(false); setLogoutConfirm(true) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-all">
                      <LogOut size={14} className="text-red-400"/>
                      <span className="text-sm font-display font-700 text-red-500">Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout modal */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-3xl text-center mb-3">👋</div>
            <h3 className="font-display font-900 text-gray-900 text-center text-lg mb-1">Log Out?</h3>
            <p className="text-sm text-gray-400 text-center mb-5">Are you sure you want to log out of HabitFlow?</p>
            <div className="flex gap-3">
              <button onClick={() => setLogoutConfirm(false)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-display font-800 text-sm">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-display font-800 text-sm">Log Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
