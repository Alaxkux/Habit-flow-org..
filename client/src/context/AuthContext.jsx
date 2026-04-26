import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { pushNotification } from '../utils/notifications'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('hf_token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/auth/me')
        .then(res => {
          setUser(res.data)
          // Welcome back notification (once per session)
          const lastSession = sessionStorage.getItem('hf_welcomed')
          if (!lastSession) {
            sessionStorage.setItem('hf_welcomed', '1')
            pushNotification({
              type: 'welcome',
              title: `Welcome back, ${res.data.firstName}! 👋`,
              body: "Great to see you again. Let's keep the momentum going!",
            })
          }
        })
        .catch(() => { localStorage.removeItem('hf_token'); delete api.defaults.headers.common['Authorization'] })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('hf_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    sessionStorage.setItem('hf_welcomed', '1')
    pushNotification({
      type: 'welcome',
      title: `Welcome back, ${userData.firstName}! 👋`,
      body: "You're logged in and ready to build great habits.",
    })
  }

  const register = (token, userData) => {
    localStorage.setItem('hf_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    sessionStorage.setItem('hf_welcomed', '1')
    pushNotification({
      type: 'welcome',
      title: `Welcome to HabitFlow, ${userData.firstName}! 🌱`,
      body: "Your journey starts now. Create your first habit and let's go!",
    })
  }

  const logout = () => {
    localStorage.removeItem('hf_token')
    sessionStorage.removeItem('hf_welcomed')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }))
    pushNotification({ type: 'info', title: '✅ Profile updated', body: 'Your profile changes have been saved.' })
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
