import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Bell, LogOut, ChevronRight, BellOff, BellRing } from 'lucide-react'

const Settings = () => {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [section, setSection] = useState(null)
  const [profile, setProfile] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [notifSettings, setNotifSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hf_notif_settings')) || { daily: true, streaks: true, badges: true, tips: false } }
    catch { return { daily: true, streaks: true, badges: true, tips: false } }
  })

  const saveProfile = async () => {
    if (!profile.firstName.trim()) return toast.error('First name is required')
    setLoading(true)
    try {
      const res = await api.put('/auth/profile', profile)
      updateUser(res.data)
      toast.success('Profile updated!')
      setSection(null)
    } catch { toast.error('Failed to update profile') }
    finally { setLoading(false) }
  }

  const changePassword = async () => {
    if (!passwords.currentPassword) return toast.error('Enter your current password')
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await api.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      toast.success('Password changed!')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSection(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally { setLoading(false) }
  }

  const toggleNotif = (key) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] }
    setNotifSettings(updated)
    localStorage.setItem('hf_notif_settings', JSON.stringify(updated))
    toast.success(`${updated[key] ? 'Enabled' : 'Disabled'} ${key} notifications`)
  }

  const handleLogout = () => { logout(); navigate('/') }

  const inputClass = "w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-all"

  const MenuItem = ({ icon: Icon, label, color = 'text-gray-700', onClick, danger }) => (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-all rounded-2xl ${danger ? 'text-red-500' : color}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? 'bg-red-50' : 'bg-green-50'}`}>
        <Icon size={18} className={danger ? 'text-red-500' : 'text-green-600'} />
      </div>
      <span className="flex-1 text-left font-display font-700 text-sm">{label}</span>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  )

  const Toggle = ({ label, desc, value, onToggle }) => (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-display font-700 text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${value ? 'bg-green-500' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${value ? 'left-6' : 'left-0.5'}`}/>
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-green-50 pb-28 md:pb-8 md:ml-64 overflow-x-hidden">
      <Navbar title="Settings"/>
      <div className="h-14 md:hidden"/>

      <div className="px-4 py-4 md:px-8 md:py-8 max-w-2xl mx-auto w-full">
        <h1 className="font-display font-900 text-2xl text-gray-900 mb-5 hidden md:block">Settings</h1>

        {/* Avatar card */}
        <div className="bg-white rounded-3xl p-5 shadow-card mb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center font-display font-900 text-white text-2xl shadow-md">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="font-display font-900 text-lg text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        {/* Account Menu */}
        <div className="bg-white rounded-3xl shadow-card overflow-hidden mb-4">
          <div className="divide-y divide-gray-50 px-2 py-2">
            <MenuItem icon={User} label="Edit Profile" onClick={() => setSection(section === 'profile' ? null : 'profile')} />
            {section === 'profile' && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex gap-3">
                  <input value={profile.firstName} onChange={e => setProfile(p => ({...p, firstName: e.target.value}))}
                    placeholder="First name" className={inputClass} />
                  <input value={profile.lastName} onChange={e => setProfile(p => ({...p, lastName: e.target.value}))}
                    placeholder="Last name" className={inputClass} />
                </div>
                <button onClick={saveProfile} disabled={loading}
                  className="w-full py-3 rounded-2xl bg-green-500 text-white font-display font-800 text-sm hover:bg-green-600 transition-all disabled:opacity-60">
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}

            <MenuItem icon={Lock} label="Change Password" onClick={() => setSection(section === 'password' ? null : 'password')} />
            {section === 'password' && (
              <div className="px-4 pb-4 space-y-3">
                {['currentPassword','newPassword','confirmPassword'].map(k => (
                  <input key={k} type="password" value={passwords[k]}
                    onChange={e => setPasswords(p => ({...p, [k]: e.target.value}))}
                    placeholder={k === 'currentPassword' ? 'Current password' : k === 'newPassword' ? 'New password' : 'Confirm new password'}
                    className={inputClass} />
                ))}
                <button onClick={changePassword} disabled={loading}
                  className="w-full py-3 rounded-2xl bg-green-500 text-white font-display font-800 text-sm hover:bg-green-600 transition-all disabled:opacity-60">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}

            <MenuItem icon={Bell} label="Notifications" onClick={() => setSection(section === 'notifs' ? null : 'notifs')} />
            {section === 'notifs' && (
              <div className="px-4 pb-4 space-y-1">
                <Toggle label="Daily Reminders" desc="Remind me to check in each day" value={notifSettings.daily} onToggle={() => toggleNotif('daily')} />
                <Toggle label="Streak Alerts" desc="Alert when streak is at risk" value={notifSettings.streaks} onToggle={() => toggleNotif('streaks')} />
                <Toggle label="Badge Unlocks" desc="Notify when I earn a badge" value={notifSettings.badges} onToggle={() => toggleNotif('badges')} />
                <Toggle label="Daily Tips" desc="Receive habit-building tips" value={notifSettings.tips} onToggle={() => toggleNotif('tips')} />
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-3xl shadow-card overflow-hidden px-2 py-2">
          <MenuItem icon={LogOut} label="Log Out" danger onClick={() => setLogoutConfirm(true)} />
        </div>

        <p className="text-center text-xs text-gray-300 mt-6 font-display">HabitFlow v1.0.0 · Built by Dev_Al-ameen</p>
      </div>

      {/* Logout Confirm */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-3xl text-center mb-3">👋</div>
            <h3 className="font-display font-900 text-gray-900 text-center text-lg mb-1">Log Out?</h3>
            <p className="text-sm text-gray-400 text-center mb-5">Are you sure you want to log out of HabitFlow?</p>
            <div className="flex gap-3">
              <button onClick={() => setLogoutConfirm(false)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-display font-800 text-sm hover:bg-gray-200 transition-all">
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
    </div>
  )
}

export default Settings
