import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Bell, LogOut, ChevronRight } from 'lucide-react'

const Settings = () => {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [section,   setSection]   = useState(null)
  const [profile,   setProfile]   = useState({ firstName: user?.firstName||'', lastName: user?.lastName||'' })
  const [passwords, setPasswords] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [loading,   setLoading]   = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [notifSettings, setNotifSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hf_notif_settings')) || { daily:true, streaks:true, badges:true, tips:false } }
    catch { return { daily:true, streaks:true, badges:true, tips:false } }
  })

  const saveProfile = async () => {
    if (!profile.firstName.trim()) return toast.error('First name required')
    setLoading(true)
    try { const r = await api.put('/auth/profile', profile); updateUser(r.data); toast.success('Profile updated!'); setSection(null) }
    catch { toast.error('Failed to update') }
    finally { setLoading(false) }
  }

  const changePassword = async () => {
    if (!passwords.currentPassword) return toast.error('Enter current password')
    if (passwords.newPassword.length < 6) return toast.error('Password must be 6+ characters')
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match')
    setLoading(true)
    try { await api.put('/auth/password', { currentPassword:passwords.currentPassword, newPassword:passwords.newPassword }); toast.success('Password changed!'); setPasswords({ currentPassword:'', newPassword:'', confirmPassword:'' }); setSection(null) }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  const toggleNotif = (key) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] }
    setNotifSettings(updated)
    localStorage.setItem('hf_notif_settings', JSON.stringify(updated))
    toast.success(`${updated[key] ? 'Enabled' : 'Disabled'} ${key} notifications`)
  }

  const inputStyle = { backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-page-text)' }

  const MenuItem = ({ icon:Icon, label, danger, onClick }) => (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all"
      style={{ color: danger ? '#EF4444' : 'var(--color-page-text)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: danger ? '#FEF2F2' : 'var(--color-accent-light)' }}>
        <Icon size={18} style={{ color: danger ? '#EF4444' : 'var(--color-accent)' }}/>
      </div>
      <span className="flex-1 text-left font-display font-700 text-sm">{label}</span>
      <ChevronRight size={16} style={{ color:'var(--color-sub-text)' }}/>
    </button>
  )

  const Toggle = ({ label, desc, value, onToggle }) => (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-display font-700 theme-text">{label}</p>
        <p className="text-xs theme-sub mt-0.5">{desc}</p>
      </div>
      <button onClick={onToggle}
        className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
        style={{ backgroundColor: value ? 'var(--color-accent)' : 'var(--color-border)' }}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${value ? 'left-6' : 'left-0.5'}`}/>
      </button>
    </div>
  )

  return (
    <div className="min-h-screen theme-bg pb-28 md:pb-8 md:ml-72 overflow-x-hidden">
      <Navbar title="Settings"/>
      <div className="h-14 md:hidden"/>
      <div className="px-4 py-4 md:px-8 md:py-8 max-w-2xl mx-auto w-full">
        <h1 className="font-display font-900 text-2xl theme-text mb-5 hidden md:block">Settings</h1>

        {/* Avatar card */}
        <div className="theme-card rounded-3xl p-5 shadow-card mb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center font-display font-900 text-white text-2xl shadow-md"
            style={{ backgroundColor:'var(--color-accent)' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="font-display font-900 text-lg theme-text">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm theme-sub">{user?.email}</p>
          </div>
        </div>

        {/* Account menu */}
        <div className="theme-card rounded-3xl shadow-card overflow-hidden mb-4">
          <div className="divide-y px-2 py-2" style={{ borderColor:'var(--color-border)' }}>
            <MenuItem icon={User} label="Edit Profile" onClick={() => setSection(s => s==='profile' ? null : 'profile')}/>
            {section === 'profile' && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex gap-3">
                  <input value={profile.firstName} onChange={e => setProfile(p=>({...p,firstName:e.target.value}))} placeholder="First name"
                    className="flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none" style={inputStyle}/>
                  <input value={profile.lastName}  onChange={e => setProfile(p=>({...p,lastName:e.target.value}))}  placeholder="Last name"
                    className="flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none" style={inputStyle}/>
                </div>
                <button onClick={saveProfile} disabled={loading}
                  className="w-full py-3 rounded-2xl text-white font-display font-800 text-sm disabled:opacity-60"
                  style={{ backgroundColor:'var(--color-accent)' }}>
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}

            <MenuItem icon={Lock} label="Change Password" onClick={() => setSection(s => s==='password' ? null : 'password')}/>
            {section === 'password' && (
              <div className="px-4 pb-4 space-y-3">
                {['currentPassword','newPassword','confirmPassword'].map(k => (
                  <input key={k} type="password" value={passwords[k]}
                    onChange={e => setPasswords(p=>({...p,[k]:e.target.value}))}
                    placeholder={k==='currentPassword'?'Current password':k==='newPassword'?'New password':'Confirm password'}
                    className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none" style={inputStyle}/>
                ))}
                <button onClick={changePassword} disabled={loading}
                  className="w-full py-3 rounded-2xl text-white font-display font-800 text-sm disabled:opacity-60"
                  style={{ backgroundColor:'var(--color-accent)' }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}

            <MenuItem icon={Bell} label="Notifications" onClick={() => setSection(s => s==='notifs' ? null : 'notifs')}/>
            {section === 'notifs' && (
              <div className="px-4 pb-4 space-y-1">
                <Toggle label="Daily Reminders"  desc="Remind me to check in each day"         value={notifSettings.daily}   onToggle={() => toggleNotif('daily')}/>
                <Toggle label="Streak Alerts"    desc="Alert when streak is at risk"            value={notifSettings.streaks} onToggle={() => toggleNotif('streaks')}/>
                <Toggle label="Badge Unlocks"    desc="Notify when I earn a badge"              value={notifSettings.badges}  onToggle={() => toggleNotif('badges')}/>
                <Toggle label="Daily Tips"       desc="Receive habit-building tips"             value={notifSettings.tips}    onToggle={() => toggleNotif('tips')}/>
              </div>
            )}
          </div>
        </div>

        {/* XP Store shortcut */}
        <div className="theme-card rounded-3xl shadow-card overflow-hidden mb-4 px-2 py-2">
          <button onClick={() => navigate('/xp-store')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-amber-50">⚡</div>
            <div className="flex-1 text-left">
              <p className="font-display font-700 text-sm text-amber-600">XP Store</p>
              <p className="text-xs theme-sub">Themes, power-ups & perks</p>
            </div>
            <ChevronRight size={16} style={{ color:'var(--color-sub-text)' }}/>
          </button>
        </div>

        {/* Logout */}
        <div className="theme-card rounded-3xl shadow-card overflow-hidden px-2 py-2">
          <MenuItem icon={LogOut} label="Log Out" danger onClick={() => setLogoutConfirm(true)}/>
        </div>

        <p className="text-center text-xs theme-sub mt-6 font-display opacity-50">HabitFlow v1.0.0 · Dev_Al-ameen</p>
      </div>

      {logoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="theme-card rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-3xl text-center mb-3">👋</div>
            <h3 className="font-display font-900 theme-text text-center text-lg mb-1">Log Out?</h3>
            <p className="text-sm theme-sub text-center mb-5">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button onClick={() => setLogoutConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-display font-800 text-sm"
                style={{ backgroundColor:'var(--color-bg)', color:'var(--color-page-text)' }}>Cancel</button>
              <button onClick={() => { logout(); navigate('/') }}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-display font-800 text-sm">Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
