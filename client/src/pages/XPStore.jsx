import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import { pushNotification } from '../utils/notifications'
import { launchConfetti } from '../utils/confetti'
import { ShoppingBag, Lock, Check } from 'lucide-react'

const THEMES = [
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    desc: 'Deep greens and earthy tones. Stay grounded.',
    cost: 0,
    preview: { bg: '#F0FDF4', accent: '#16A34A', card: '#DCFCE7' },
    free: true,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    desc: 'Cool blues and aqua. Calm and focused.',
    cost: 150,
    preview: { bg: '#EFF6FF', accent: '#2563EB', card: '#DBEAFE' },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    desc: 'Warm oranges and pinks. Energize your day.',
    cost: 250,
    preview: { bg: '#FFF7ED', accent: '#EA580C', card: '#FFEDD5' },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    desc: 'Dark mode with soft purple. Focus in the dark.',
    cost: 350,
    preview: { bg: '#1E1B4B', accent: '#A78BFA', card: '#312E81' },
    dark: true,
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    emoji: '🌸',
    desc: 'Soft pinks and rose. Bloom every day.',
    cost: 400,
    preview: { bg: '#FFF1F2', accent: '#E11D48', card: '#FFE4E6' },
  },
  {
    id: 'gold',
    name: 'Champion',
    emoji: '🏆',
    desc: 'Gold and black. For the elite only.',
    cost: 600,
    preview: { bg: '#FFFBEB', accent: '#B45309', card: '#FEF3C7' },
  },
]

const POWERUPS = [
  { id: 'xp_boost',    name: 'XP Boost',       emoji: '⚡', desc: '+50% XP for 24 hours',       cost: 100 },
  { id: 'streak_save', name: 'Streak Shield',   emoji: '🛡️', desc: 'Protect 1 streak from breaking', cost: 200 },
  { id: 'badge_boost', name: 'Badge Reveal',    emoji: '🔍', desc: 'Preview next badge criteria',  cost: 80 },
]

const XPStore = () => {
  const [levelInfo, setLevelInfo] = useState(null)
  const [ownedThemes, setOwnedThemes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hf_owned_themes')) || ['forest'] } catch { return ['forest'] }
  })
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('hf_active_theme') || 'forest')
  const [ownedPowerups, setOwnedPowerups] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hf_owned_powerups')) || [] } catch { return [] }
  })
  const [tab, setTab] = useState('themes')
  const [buying, setBuying] = useState(null)
  const [confirmItem, setConfirmItem] = useState(null)

  useEffect(() => {
    api.get('/logs/xp').then(r => setLevelInfo(r.data)).catch(() => {})
  }, [])

  const spendXP = async (cost) => {
    // Deduct XP via server
    try {
      await api.post('/logs/spend-xp', { amount: cost })
      const xpRes = await api.get('/logs/xp')
      setLevelInfo(xpRes.data)
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Not enough XP')
      return false
    }
  }

  const buyTheme = async (theme) => {
    if (ownedThemes.includes(theme.id)) {
      // Just activate
      setActiveTheme(theme.id)
      localStorage.setItem('hf_active_theme', theme.id)
      toast.success(`${theme.emoji} ${theme.name} theme activated!`)
      return
    }
    setConfirmItem({ ...theme, kind: 'theme' })
  }

  const buyPowerup = async (p) => {
    setConfirmItem({ ...p, kind: 'powerup' })
  }

  const confirmPurchase = async () => {
    const item = confirmItem
    setConfirmItem(null)
    setBuying(item.id)
    const ok = await spendXP(item.cost)
    setBuying(null)
    if (!ok) return

    if (item.kind === 'theme') {
      const newOwned = [...ownedThemes, item.id]
      setOwnedThemes(newOwned)
      localStorage.setItem('hf_owned_themes', JSON.stringify(newOwned))
      setActiveTheme(item.id)
      localStorage.setItem('hf_active_theme', item.id)
      pushNotification({ type: 'badge', title: `${item.emoji} Theme unlocked!`, body: `"${item.name}" theme is now active.` })
      launchConfetti({ duration: 2000 })
      toast.success(`${item.emoji} ${item.name} theme unlocked!`)
    } else {
      const newOwned = [...ownedPowerups, { id: item.id, expiresAt: Date.now() + 86400000 }]
      setOwnedPowerups(newOwned)
      localStorage.setItem('hf_owned_powerups', JSON.stringify(newOwned))
      pushNotification({ type: 'xp', title: `${item.emoji} Power-Up activated!`, body: `${item.name} is now active.` })
      toast.success(`${item.emoji} ${item.name} activated!`)
    }
  }

  const canAfford = (cost) => (levelInfo?.xp || 0) >= cost

  return (
    <div className="min-h-screen bg-green-50 pb-28 md:pb-8 md:ml-64 overflow-x-hidden">
      <Navbar title="XP Store"/>
      <div className="h-14 md:hidden"/>

      <div className="px-4 py-4 md:px-8 md:py-8 max-w-2xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display font-900 text-2xl text-gray-900 hidden md:block">XP Store</h1>
            <p className="text-sm text-gray-400">Spend your XP on themes & power-ups</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2 flex items-center gap-2 flex-shrink-0">
            <span className="text-lg">⚡</span>
            <div>
              <p className="font-display font-900 text-amber-600 text-base leading-none">{levelInfo?.xp || 0}</p>
              <p className="text-[10px] text-amber-400">XP available</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[['themes','🎨 Themes'],['powerups','⚡ Power-Ups']].map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`px-4 py-2 rounded-2xl font-display font-800 text-sm transition-all
                ${tab===v ? 'bg-green-500 text-white shadow-sm' : 'bg-white text-gray-500 hover:bg-green-50'}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'themes' && (
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map(theme => {
              const owned   = ownedThemes.includes(theme.id)
              const active  = activeTheme === theme.id
              const afford  = theme.free || canAfford(theme.cost)
              return (
                <div key={theme.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-card border-2 transition-all
                    ${active ? 'border-green-500' : 'border-transparent'}`}>
                  {/* Preview swatch */}
                  <div className="h-16 w-full relative flex items-center justify-center"
                    style={{ backgroundColor: theme.preview.bg }}>
                    <div className="flex gap-1.5">
                      <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: theme.preview.accent }}/>
                      <div className="w-10 h-6 rounded-lg" style={{ backgroundColor: theme.preview.card }}/>
                      <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: theme.preview.accent + '80' }}/>
                    </div>
                    {active && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={11} className="text-white"/>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{theme.emoji}</span>
                      <p className="font-display font-800 text-gray-900 text-sm">{theme.name}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">{theme.desc}</p>
                    <button
                      onClick={() => buyTheme(theme)}
                      disabled={buying===theme.id || (!owned && !afford)}
                      className={`w-full py-2 rounded-xl font-display font-800 text-xs transition-all
                        ${active ? 'bg-green-50 text-green-600 cursor-default'
                          : owned ? 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
                          : afford ? 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                      {active ? '✓ Active' : owned ? 'Activate' : !afford ? <span className="flex items-center justify-center gap-1"><Lock size={10}/>{theme.cost} XP</span> : `⚡ ${theme.cost} XP`}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'powerups' && (
          <div className="grid grid-cols-2 gap-3">
            {POWERUPS.map(p => {
              const afford = canAfford(p.cost)
              const owned  = ownedPowerups.find(o => o.id === p.id)
              return (
                <div key={p.id} className="bg-white rounded-2xl p-4 shadow-card border-2 border-transparent">
                  <div className="text-3xl mb-2">{p.emoji}</div>
                  <p className="font-display font-800 text-gray-900 text-sm mb-1">{p.name}</p>
                  <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">{p.desc}</p>
                  {owned ? (
                    <div className="w-full py-2 rounded-xl bg-green-50 text-green-600 text-xs font-display font-800 text-center">✓ Active</div>
                  ) : (
                    <button onClick={() => buyPowerup(p)} disabled={!afford || buying===p.id}
                      className={`w-full py-2 rounded-xl font-display font-800 text-xs transition-all
                        ${afford ? 'bg-amber-400 text-white hover:bg-amber-500 active:scale-95' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                      {afford ? `⚡ ${p.cost} XP` : <span className="flex items-center justify-center gap-1"><Lock size={10}/>{p.cost} XP</span>}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-300 mt-6 font-display">Earn XP by checking in habits daily</p>
      </div>

      {/* Confirm purchase modal */}
      {confirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-4xl text-center mb-3">{confirmItem.emoji}</div>
            <h3 className="font-display font-900 text-gray-900 text-center text-lg mb-1">Buy {confirmItem.name}?</h3>
            <p className="text-sm text-gray-400 text-center mb-2">{confirmItem.desc}</p>
            <div className="bg-amber-50 rounded-2xl py-2 px-4 text-center mb-5">
              <p className="text-sm font-display font-800 text-amber-600">⚡ {confirmItem.cost} XP will be spent</p>
              <p className="text-xs text-amber-400">You have {levelInfo?.xp || 0} XP</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmItem(null)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-display font-800 text-sm">Cancel</button>
              <button onClick={confirmPurchase} className="flex-1 py-3 rounded-2xl bg-amber-400 text-white font-display font-800 text-sm hover:bg-amber-500">Buy Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default XPStore
