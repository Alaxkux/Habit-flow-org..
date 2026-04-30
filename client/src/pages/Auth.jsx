import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

const AuthIllustration = () => (
  <svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
    <ellipse cx="150" cy="230" rx="130" ry="18" fill="rgba(0,0,0,0.08)"/>
    <rect x="55" y="170" width="190" height="12" rx="5" fill="#2E7D32"/>
    <rect x="70" y="182" width="10" height="38" rx="3" fill="#388E3C"/>
    <rect x="220" y="182" width="10" height="38" rx="3" fill="#388E3C"/>
    <rect x="110" y="140" width="80" height="32" rx="4" fill="#1B5E20"/>
    <rect x="113" y="143" width="74" height="26" rx="2" fill="#263238"/>
    <rect x="115" y="145" width="70" height="22" rx="2" fill="#37474F"/>
    <rect x="117" y="147" width="50" height="3" rx="1" fill="rgba(255,255,255,0.3)"/>
    <rect x="117" y="152" width="36" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
    <rect x="117" y="156" width="44" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
    <rect x="100" y="172" width="100" height="5" rx="2" fill="#1B5E20"/>
    <rect x="128" y="108" width="44" height="56" rx="10" fill="#4CAF50"/>
    <rect x="134" y="114" width="32" height="44" rx="7" fill="#66BB6A"/>
    <ellipse cx="150" cy="162" rx="22" ry="8" fill="#388E3C"/>
    <rect x="130" y="120" width="40" height="42" rx="10" fill="#2196F3"/>
    <ellipse cx="123" cy="148" rx="9" ry="6" fill="#2196F3" transform="rotate(-20 123 148)"/>
    <ellipse cx="177" cy="148" rx="9" ry="6" fill="#2196F3" transform="rotate(20 177 148)"/>
    <circle cx="115" cy="153" r="6" fill="#FFCC80"/>
    <circle cx="185" cy="153" r="6" fill="#FFCC80"/>
    <circle cx="150" cy="104" r="22" fill="#FFCC80"/>
    <path d="M128 100 Q130 78 150 76 Q170 78 172 100 Q165 88 150 87 Q135 88 128 100Z" fill="#5D4037"/>
    <circle cx="143" cy="104" r="3" fill="#333"/>
    <circle cx="157" cy="104" r="3" fill="#333"/>
    <path d="M145 113 Q150 118 155 113" stroke="#E65100" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <rect x="82" y="160" width="20" height="14" rx="3" fill="#fff"/>
    <rect x="85" y="162" width="14" height="3" rx="1" fill="#A5D6A7"/>
    <rect x="38" y="175" width="14" height="40" rx="3" fill="#5D4037"/>
    <ellipse cx="45" cy="155" rx="22" ry="26" fill="#388E3C"/>
    <ellipse cx="33" cy="165" rx="14" ry="18" fill="#43A047"/>
    <ellipse cx="57" cy="163" rx="14" ry="18" fill="#2E7D32"/>
    <rect x="192" y="108" width="64" height="28" rx="8" fill="#fff" opacity="0.95"/>
    <circle cx="207" cy="122" r="7" fill="#4CAF50"/>
    <polyline points="203,122 206,125 211,119" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="218" y="117" width="30" height="4" rx="2" fill="#E0E0E0"/>
    <rect x="218" y="123" width="20" height="3" rx="1.5" fill="#C8E6C9"/>
    <rect x="40" y="100" width="58" height="26" rx="8" fill="#fff" opacity="0.9"/>
    <text x="48" y="117" fontFamily="Nunito" fontSize="13" fontWeight="900" fill="#FF6F00">🔥 7 day</text>
  </svg>
)

const Auth = () => {
  const [tab, setTab] = useState('login')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const { login, register } = useAuth()   // ← pull both
  const navigate = useNavigate()

  const update = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const isLogin = tab === 'login'
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const payload  = isLogin
        ? { email: form.email, password: form.password }
        : { firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password }

      const res = await api.post(endpoint, payload)

      // Bug 3 fix: use register() for signup, login() for login
      if (isLogin) {
        login(res.data.token, res.data.user)
      } else {
        register(res.data.token, res.data.user)
      }

      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-body placeholder-gray-400 focus:outline-none focus:border-green-400 focus:bg-white transition-all"

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-pop overflow-hidden flex flex-col md:flex-row min-h-[580px]">

        {/* LEFT */}
        <div className="hidden md:flex flex-col flex-1 bg-gradient-to-br from-green-300 via-green-500 to-green-800 p-10 items-center justify-center relative overflow-hidden">
          <div className="absolute w-64 h-64 rounded-full bg-white/10 -top-16 -left-16"/>
          <div className="absolute w-40 h-40 rounded-full bg-white/10 -bottom-10 -right-10"/>
          <AuthIllustration/>
          <div className="text-center mt-6 z-10">
            <h2 className="font-display font-900 text-2xl text-white leading-tight">Build habits that<br/>change your life</h2>
            <p className="text-green-100 text-sm mt-2 max-w-xs">Track daily goals, earn streaks, and grow every single day.</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-7">
            <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center font-display font-900 text-white text-base shadow">H</div>
            <span className="font-display font-900 text-xl text-gray-900">HabitFlow</span>
          </div>

          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6 w-fit">
            {['login','signup'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-7 py-2 rounded-xl text-sm font-display font-700 transition-all ${tab===t ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
                {t === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          <h2 className="font-display font-900 text-2xl sm:text-3xl text-gray-900 mb-6 leading-tight whitespace-pre-line">
            {tab === 'login' ? 'Welcome\nback 👋' : 'Create\naccount'}
          </h2>

          <div className="space-y-3">
            {tab === 'signup' && (
              <div className="flex gap-3">
                <input name="firstName" value={form.firstName} onChange={update} placeholder="First name" className={inputClass}/>
                <input name="lastName"  value={form.lastName}  onChange={update} placeholder="Last name"  className={inputClass}/>
              </div>
            )}
            <input name="email" type="email" value={form.email} onChange={update} placeholder="Email address" className={inputClass}/>
            <div className="relative">
              <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={update} placeholder="Password" className={`${inputClass} pr-12`}/>
              <button onClick={() => setShowPw(v=>!v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
            {tab === 'login' && (
              <div className="text-right"><a href="#" className="text-xs text-green-700 font-700">Forgot password?</a></div>
            )}
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="mt-5 w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 active:scale-95 text-white font-display font-800 text-base transition-all shadow-md disabled:opacity-60">
            {loading ? 'Please wait...' : tab === 'login' ? 'Log in' : 'Create account'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-5">
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setTab(tab === 'login' ? 'signup' : 'login')} className="text-green-700 font-700">
              {tab === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
