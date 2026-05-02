import { Zap } from 'lucide-react'

const LEVEL_EMOJIS = ['','🌱','🌿','💪','🏃','⚡','🎯','🔥','💎','👑','🏆']

const XPCard = ({ levelInfo }) => {
  if (!levelInfo) return (
    <div className="theme-card rounded-2xl p-4 shadow-card animate-pulse">
      <div className="h-5 rounded-full w-1/2 mb-3" style={{ backgroundColor:'var(--color-bg)' }}/>
      <div className="h-2 rounded-full" style={{ backgroundColor:'var(--color-bg)' }}/>
    </div>
  )

  const { level, title, xp, progressXP, neededXP, pct, maxed } = levelInfo

  return (
    <div className="theme-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor:'var(--color-accent-light)' }}>
          {LEVEL_EMOJIS[level] || '⭐'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-900 theme-text text-base leading-none">Lv.{level} — {title}</p>
          <p className="text-xs theme-sub mt-0.5 flex items-center gap-1">
            <Zap size={10} style={{ color:'var(--color-accent)' }}/>{xp} XP total
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display font-900 text-sm" style={{ color:'var(--color-accent)' }}>{pct}%</p>
          <p className="text-[10px] theme-sub">to next</p>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor:'var(--color-accent-light)' }}>
        <div className="h-full rounded-full transition-all duration-700 xp-bar-fill"
          style={{ width:`${pct}%`, backgroundColor:'var(--color-accent)' }}/>
      </div>
      {!maxed && (
        <p className="text-[10px] theme-sub mt-1 text-right">{progressXP} / {neededXP} XP</p>
      )}
      {maxed && (
        <p className="text-[10px] font-700 mt-1 text-center" style={{ color:'var(--color-accent)' }}>🏆 Maximum level reached!</p>
      )}
    </div>
  )
}

export default XPCard
