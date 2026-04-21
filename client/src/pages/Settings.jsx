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
  const [section, setSection] = useState(null)
  const [profile, setProfile] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const saveProfile = async () => {
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
    if (passwords.newPassword !== passwords.confirmPassword)
      return toast.error('Passwords do not match')
    if (passwords.newPassword.length < 6)
      return toast.error('Password must be at least 6 characters')
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

  return (
    <div className="min-h-screen bg-green-50 pb-24 md:pb-8 md:ml-64">
      <Navbar title="Settings" />

      <div className="p-4 md:p-8 max-w-2xl mx-auto">
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

        {/* Menu */}
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

            <MenuItem icon={Bell} label="Notifications" onClick={() => toast('Coming soon!')} />
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-3xl shadow-card overflow-hidden px-2 py-2">
          <MenuItem icon={LogOut} label="Log Out" danger onClick={handleLogout} />
        </div>

        <p className="text-center text-xs text-gray-300 mt-6 font-display">HabitFlow v1.0.0 · Built with ❤️</p>
      </div>
    </div>
  )
}

export default Settings
