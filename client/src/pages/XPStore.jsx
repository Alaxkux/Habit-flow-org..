import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import { pushNotification } from '../utils/notifications'
import { launchConfetti } from '../utils/confetti'
import { useTheme, THEMES } from '../context/ThemeContext'
import { usePowerUp } from '../context/PowerUpContext'
import { Lock, Check, Zap } from 'lucide-react'

const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

const POWERUPS = [
  { id:'xp_boost',      name:'XP Boost',       emoji:'⚡', desc:'+50% XP for 24 hours on all check-ins.',     cost:100, duration:'24h', category:'boost' },
  { id:'double_day',    name:'Double Day',      emoji:'💥', desc:'2× XP on every check-in today.',             cost:150, duration:'24h', category:'boost' },
  { id:'xp_rain',       name:'XP Rain',         emoji:'🌧️',desc:'Earn +25% bonus XP per habit for 3 days.',   cost:250, duration:'3d',  category:'boost' },
  { id:'streak_shield', name:'Streak Shield',   emoji:'🛡️', desc:'Protect one streak from breaking this week.',cost:200, duration:'7d',  category:'protect' },
  { id:'time_freeze',   name:'Time Freeze',     emoji:'🧊', desc:'Pause streak countdown for 48 hours.',       cost:300, duration:'48h', category:'protect' },
  { id:'badge_peek',    name:'Badge Peek',       emoji:'🔍', desc:'Reveal your next closest badge criteria.',   cost:80,  duration:'once',category:'info' },
]

const PERKS = [
  { id:'rainbow_bar',   name:'Rainbow XP Bar',    emoji:'🌈', desc:'XP progress bar becomes an animated rainbow gradient.', cost:160, effect:'Applies rainbow animation to your XP bar.' },
  { id:'custom_avatar', name:'Avatar Glow',        emoji:'🖼️', desc:'Your profile avatar gets a glowing accent ring.',       cost:120, effect:'Glowing ring appears on your avatar everywhere.' },
  { id:'confetti_plus', name:'Mega Confetti',      emoji:'🎊', desc:'Bigger, longer celebration confetti on milestones.',    cost:100, effect:'Confetti lasts 5 seconds instead of 3.' },
  { id:'dark_cards',    name:'Dark Habit Cards',   emoji:'🌑', desc:'Habit cards render in dark style regardless of theme.', cost:200, effect:'All habit cards go dark.' },
  { id:'sound_pack',    name:'Sound Pack',          emoji:'🎵', desc:'Satisfying audio feedback on every check-in.',          cost:150, effect:'Chord plays on each habit completion.' },
  { id:'streak_fire',   name:'Flame Streak Style', emoji:'🔥', desc:'Streak numbers replaced with animated flame emojis.',   cost:180, effect:'🔥🔥🔥 instead of plain streak count.' },
]

const CAT_STYLE = {
  boost:   'bg-amber-50 text-amber-600 border-amber-100',
  protect: 'bg-blue-50 text-blue-600 border-blue-100',
  info:    'bg-purple-50 text-purple-600 border-purple-100',
}

const TABS = [
  { id:'themes',   label:'Themes',    icon:'🎨' },
  { id:'powerups', label:'Power-Ups', icon:'⚡' },
  { id:'perks',    label:'Perks',     icon:'✨' },
]

const XPStore = () => {
  const { activeTheme, setTheme } = useTheme()
  const { isActive, hasPerk, activate, unlockPerk, refresh } = usePowerUp()
  const [levelInfo,   setLevelInfo]   = useState(null)
  const [ownedThemes, setOwnedThemes] = useState(() => lsGet('hf_owned_themes', ['forest']))
  const [tab,         setTab]         = useState('themes')
  const [confirm,     setConfirm]     = useState(null)
  const [busy,        setBusy]        = useState(false)

  const fetchXP = () => api.get('/logs/xp').then(r => setLevelInfo(r.data)).catch(() => {})
  useEffect(() => { fetchXP() }, [])

  const myXP      = levelInfo?.xp || 0
  const canAfford = (cost) => myXP >= cost

  const purchase = async () => {
    if (!confirm || busy) return
    setBusy(true)
    const { item, kind } = confirm
    setConfirm(null)
    try {
      const res = await api.post('/logs/spend-xp', { amount: item.cost })
      setLevelInfo(res.data) // server returns updated levelInfo

      if (kind === 'theme') {
        const next = [...new Set([...ownedThemes, item.id])]
        setOwnedThemes(next); lsSet('hf_owned_themes', next)
        setTheme(item.id) // ← actually applies CSS variables
        pushNotification({ type:'badge', title:`${item.emoji} Theme unlocked!`, body:`"${item.name}" is now active.` })
        launchConfetti({ duration: 2000 })
        toast.success(`${item.emoji} ${item.name} theme activated!`)

      } else if (kind === 'powerup') {
        activate(item.id, item.duration) // ← saves to context + localStorage
        refresh()
        pushNotification({ type:'xp', title:`${item.emoji} ${item.name} activated!`, body: item.desc })
        toast.success(`${item.emoji} ${item.name} is now active!`)

      } else if (kind === 'perk') {
        unlockPerk(item.id) // ← saves to context + localStorage
        applyPerkEffect(item.id)
        pushNotification({ type:'badge', title:`${item.emoji} ${item.name} unlocked!`, body: item.effect })
        toast.success(`${item.emoji} ${item.name} unlocked!`)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Not enough XP')
    } finally { setBusy(false) }
  }

  const applyPerkEffect = (id) => {
    const root = document.documentElement
    if (id === 'rainbow_bar')   root.classList.add('perk-rainbow-bar')
    if (id === 'custom_avatar') root.classList.add('perk-avatar-frame')
    if (id === 'dark_cards')    root.classList.add('perk-dark-cards')
  }

  // Apply owned perks on mount
  useEffect(() => {
    const root = document.documentElement
    if (hasPerk('rainbow_bar'))   root.classList.add('perk-rainbow-bar')
    if (hasPerk('custom_avatar')) root.classList.add('perk-avatar-frame')
    if (hasPerk('dark_cards'))    root.classList.add('perk-dark-cards')
  }, [])

  const activateTheme = (id) => {
    setTheme(id) // ← real CSS var application
    toast.success(`${THEMES[id]?.emoji} ${THEMES[id]?.name} activated!`)
  }

  const themeList = Object.entries(THEMES).map(([id, t]) => ({ id, ...t,
    cost: { forest:0, ocean:150, sunset:250, midnight:350, cherry:400, aurora:450, desert:300, lavender:350, champion:700 }[id] || 0,
    free: id === 'forest'
  }))

  return (
    <div className="min-h-screen theme-bg pb-28 md:pb-8 md:ml-72 overflow-x-hidden">
      <Navbar title="XP Store"/>
      <div className="h-14 md:hidden"/>

      <div className="px-4 py-4 md:px-8 md:py-8 max-w-2xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display font-900 text-2xl theme-text hidden md:block">XP Store</h1>
            <p className="text-sm theme-sub">Spend your hard-earned XP on real upgrades</p>
          </div>
          <div className="theme-card rounded-2xl px-4 py-2.5 flex items-center gap-2 flex-shrink-0 shadow-card border theme-border">
            <Zap size={16} className="text-amber-500"/>
            <div>
              <p className="font-display font-900 text-amber-500 text-lg leading-none">{myXP}</p>
              <p className="text-[10px] text-amber-400 font-600">XP available</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 theme-card rounded-2xl p-1.5 shadow-card">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-display font-700 text-sm transition-all
                ${tab===t.id ? 'theme-accent text-white shadow-sm' : 'theme-sub hover:theme-text'}`}
              style={tab===t.id ? { backgroundColor:'var(--color-accent)' } : {}}>
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── THEMES ── */}
        {tab === 'themes' && (
          <div className="grid grid-cols-2 gap-3">
            {themeList.map(theme => {
              const owned  = ownedThemes.includes(theme.id)
              const active = activeTheme === theme.id
              const afford = theme.free || canAfford(theme.cost)
              return (
                <div key={theme.id}
                  className={`theme-card rounded-2xl overflow-hidden shadow-card border-2 transition-all
                    ${active ? 'shadow-lg' : 'border-transparent hover:border-opacity-50'}`}
                  style={{ borderColor: active ? theme.accent : 'transparent' }}>

                  {/* Live preview swatch */}
                  <div className="h-20 relative flex items-center justify-center gap-2"
                    style={{ backgroundColor: theme.bg }}>
                    <div className="w-8 h-8 rounded-xl shadow" style={{ backgroundColor: theme.accent }}/>
                    <div className="w-12 h-8 rounded-xl shadow" style={{ backgroundColor: theme.bgDeep }}/>
                    <div className="w-6 h-6 rounded-full shadow" style={{ backgroundColor: theme.accent, opacity:0.6 }}/>
                    {active && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow"
                        style={{ backgroundColor: theme.accent }}>
                        <Check size={13} className="text-white"/>
                      </div>
                    )}
                    {!owned && !theme.free && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[1px]">
                        <Lock size={20} className="text-white"/>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="font-display font-800 text-sm truncate" style={{ color: theme.dark ? '#fff' : theme.accentText }}>{theme.emoji} {theme.name}</p>
                    <p className="text-[10px] theme-sub mb-2.5 leading-relaxed line-clamp-2">{theme.desc}</p>

                    {active ? (
                      <div className="w-full py-2 rounded-xl text-xs font-display font-800 text-center"
                        style={{ backgroundColor: theme.accentLight, color: theme.accentText }}>
                        ✓ Active
                      </div>
                    ) : owned ? (
                      <button onClick={() => activateTheme(theme.id)}
                        className="w-full py-2 rounded-xl text-xs font-display font-800 transition-all"
                        style={{ backgroundColor: theme.accentLight, color: theme.accentText }}>
                        Activate
                      </button>
                    ) : theme.free ? (
                      <button onClick={() => activateTheme(theme.id)}
                        className="w-full py-2 rounded-xl text-white text-xs font-display font-800 transition-all active:scale-95"
                        style={{ backgroundColor: theme.accent }}>
                        Use Free
                      </button>
                    ) : afford ? (
                      <button onClick={() => setConfirm({ item:{ ...theme }, kind:'theme' })}
                        className="w-full py-2 rounded-xl bg-amber-400 text-white text-xs font-display font-800 hover:bg-amber-500 transition-all active:scale-95">
                        ⚡ {theme.cost} XP
                      </button>
                    ) : (
                      <div className="w-full py-2 rounded-xl bg-gray-100 text-gray-300 text-xs font-display font-800 text-center flex items-center justify-center gap-1">
                        <Lock size={10}/>{theme.cost} XP
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── POWER-UPS ── */}
        {tab === 'powerups' && (
          <div className="grid grid-cols-2 gap-3">
            {POWERUPS.map(p => {
              const active = isActive(p.id)
              const afford = canAfford(p.cost)
              return (
                <div key={p.id}
                  className={`theme-card rounded-2xl p-4 shadow-card border-2 transition-all
                    ${active ? 'border-amber-300' : 'border-transparent'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-3xl">{p.emoji}</div>
                    <span className={`text-[9px] font-display font-800 px-2 py-0.5 rounded-full border ${CAT_STYLE[p.category]}`}>
                      {p.duration}
                    </span>
                  </div>
                  <p className="font-display font-800 text-sm mb-1 theme-text leading-tight">{p.name}</p>
                  <p className="text-[10px] theme-sub mb-3 leading-relaxed line-clamp-3">{p.desc}</p>
                  {active ? (
                    <div className="w-full py-2 rounded-xl bg-amber-50 text-amber-600 text-xs font-display font-800 text-center">
                      ✓ Active
                    </div>
                  ) : afford ? (
                    <button onClick={() => setConfirm({ item:p, kind:'powerup' })}
                      className="w-full py-2 rounded-xl bg-amber-400 text-white text-xs font-display font-800 hover:bg-amber-500 transition-all active:scale-95">
                      ⚡ {p.cost} XP
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-gray-100 text-gray-300 text-xs font-display font-800 text-center flex items-center justify-center gap-1">
                      <Lock size={10}/>{p.cost} XP
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── PERKS ── */}
        {tab === 'perks' && (
          <div>
            <div className="theme-card rounded-2xl p-4 mb-4 shadow-card border theme-border">
              <p className="text-xs font-display font-700 theme-sub">
                💡 Perks are permanent one-time unlocks — they apply instantly and stay forever.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PERKS.map(perk => {
                const owned  = hasPerk(perk.id)
                const afford = canAfford(perk.cost)
                return (
                  <div key={perk.id}
                    className={`theme-card rounded-2xl p-4 shadow-card border-2 transition-all
                      ${owned ? 'border-green-300' : 'border-transparent'}`}>
                    <div className="text-3xl mb-2">{perk.emoji}</div>
                    <p className="font-display font-800 text-sm mb-1 theme-text leading-tight">{perk.name}</p>
                    <p className="text-[10px] theme-sub mb-1 leading-relaxed line-clamp-2">{perk.desc}</p>
                    {owned && <p className="text-[9px] text-green-500 font-700 mb-2">✓ {perk.effect}</p>}
                    {!owned && <div className="mb-2"/>}
                    {owned ? (
                      <div className="w-full py-2 rounded-xl bg-green-50 text-green-600 text-xs font-display font-800 text-center">✓ Active</div>
                    ) : afford ? (
                      <button onClick={() => setConfirm({ item:perk, kind:'perk' })}
                        className="w-full py-2 rounded-xl text-white text-xs font-display font-800 transition-all active:scale-95"
                        style={{ backgroundColor:'var(--color-accent)' }}>
                        ⚡ {perk.cost} XP
                      </button>
                    ) : (
                      <div className="w-full py-2 rounded-xl bg-gray-100 text-gray-300 text-xs font-display font-800 text-center flex items-center justify-center gap-1">
                        <Lock size={10}/>{perk.cost} XP
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <p className="text-center text-xs theme-sub mt-8 font-display opacity-50">
          HabitFlow · Dev_Al-ameen
        </p>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setConfirm(null)}>
          <div className="theme-card rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-5xl text-center mb-3">{confirm.item.emoji}</div>
            <h3 className="font-display font-900 theme-text text-center text-lg mb-1">
              {confirm.kind === 'theme' ? 'Unlock Theme?' : confirm.kind === 'powerup' ? 'Activate Power-Up?' : 'Unlock Perk?'}
            </h3>
            <p className="text-sm theme-sub text-center mb-3">{confirm.item.name}</p>
            <div className="bg-amber-50 rounded-2xl py-3 px-4 text-center mb-5">
              <p className="text-lg font-display font-900 text-amber-500">⚡ {confirm.item.cost} XP</p>
              <p className="text-xs text-amber-400 mt-0.5">
                You have {myXP} XP · Remaining after: {myXP - confirm.item.cost}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-display font-800 text-sm">
                Cancel
              </button>
              <button onClick={purchase} disabled={busy}
                className="flex-1 py-3 rounded-2xl bg-amber-400 text-white font-display font-800 text-sm hover:bg-amber-500 disabled:opacity-60 transition-all">
                {busy ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default XPStore
