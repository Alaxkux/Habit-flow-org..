import { useNavigate } from 'react-router-dom'
import { Flame, TrendingUp, Award, Sparkles, CheckCircle } from 'lucide-react'

const FEATURES = [
  { icon: CheckCircle, color: '#4CAF50', title: 'Daily Check-ins',      desc: 'Mark habits done with one tap. Build consistency effortlessly.' },
  { icon: Flame,       color: '#FF6F00', title: 'Streak Tracking',      desc: 'Never break the chain. Watch your streaks grow day by day.' },
  { icon: TrendingUp,  color: '#42A5F5', title: 'Progress Analytics',   desc: 'Beautiful charts show your growth over time.' },
  { icon: Award,       color: '#AB47BC', title: 'Badges & Rewards',     desc: 'Earn badges as you hit milestones and stay motivated.' },
  { icon: Sparkles,    color: '#FF7043', title: 'AI Habit Coaching', desc: 'Smart AI suggests habits tailored to your personal goals.' },
]

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center font-display font-900 text-white">H</div>
          <span className="font-display font-900 text-xl text-gray-900">HabitFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/auth')}
            className="text-sm font-display font-700 text-gray-600 hover:text-green-700 transition-colors px-3 py-1.5">
            Log in
          </button>
          <button onClick={() => navigate('/auth')}
            className="text-sm font-display font-800 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-all shadow-sm">
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50 px-4 sm:px-8 pt-16 pb-20 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full bg-green-100/60 -top-32 -left-32 blur-3xl"/>
          <div className="absolute w-80 h-80 rounded-full bg-green-100/40 -bottom-20 -right-20 blur-3xl"/>
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-display font-800 mb-6">
            <Sparkles size={13}/> AI-powered habit coaching
          </div>
          <h1 className="font-display font-900 text-4xl sm:text-5xl md:text-6xl text-gray-900 leading-tight mb-5">
            Build habits that<br/><span className="text-green-500">actually stick</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-md mx-auto mb-8 leading-relaxed">
            Track your daily goals, earn streaks, unlock badges, and get personalized AI coaching — all in one beautiful app.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-green-500 hover:bg-green-600 active:scale-95 text-white font-display font-900 text-base shadow-pop transition-all">
              Start for free 🌱
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl border-2 border-gray-200 hover:border-green-300 text-gray-600 font-display font-800 text-base transition-all">
              See how it works
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-400">
            <div className="flex -space-x-2">
              {['#4CAF50','#42A5F5','#FF7043','#AB47BC'].map((c,i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-800"
                  style={{ backgroundColor: c }}>
                  {['A','B','C','D'][i]}
                </div>
              ))}
            </div>
            <span>Loved by <strong className="text-gray-600">1,200+</strong> habit builders</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-8 py-16 max-w-4xl mx-auto">
        <h2 className="font-display font-900 text-2xl sm:text-3xl text-gray-900 text-center mb-10">
          Everything you need to build better habits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-white rounded-3xl p-5 shadow-card hover:shadow-pop transition-all group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ backgroundColor: color + '18' }}>
                <Icon size={24} style={{ color }} />
              </div>
              <h3 className="font-display font-800 text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-8 py-16 mx-4 sm:mx-8 mb-8 rounded-3xl bg-gradient-to-br from-green-500 to-green-700 text-center">
        <div className="text-5xl mb-4">🌱</div>
        <h2 className="font-display font-900 text-2xl sm:text-3xl text-white mb-3">Ready to build better habits?</h2>
        <p className="text-green-100 text-sm sm:text-base mb-6 max-w-sm mx-auto">
          Join thousands of people transforming their lives one habit at a time.
        </p>
        <button onClick={() => navigate('/auth')}
          className="px-8 py-4 rounded-2xl bg-white text-green-700 font-display font-900 text-base hover:bg-green-50 active:scale-95 shadow-pop transition-all">
          Get started free 🚀
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-300 font-display">
        © 2025 HabitFlow · Built by Dev_Al-ameen
      </footer>
    </div>
  )
}

export default Landing
