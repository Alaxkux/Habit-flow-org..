import { Zap } from 'lucide-react'

const LEVEL_EMOJIS = ['','🌱','🌿','💪','🏃','⚡','🎯','🔥','💎','👑','🏆']

const XPCard = ({ levelInfo }) => {
  if (!levelInfo) return null
  const { level, title, xp, progressXP, neededXP, pct, maxed } = levelInfo

  return (
    <div className="bg-white rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl flex-shrink-0">
          {LEVEL_EMOJIS[level] || '⭐'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display font-900 text-gray-900 text-base leading-none">Lv.{level} — {title}</p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <Zap size={10} className="text-amber-400"/>
            {xp} XP total
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display font-900 text-amber-500 text-sm">{pct}%</p>
          <p className="text-[10px] text-gray-300">to next</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #F59E0B, #FBBF24)'
          }}
        />
      </div>
      {!maxed && (
        <p className="text-[10px] text-gray-300 mt-1 text-right">{progressXP} / {neededXP} XP</p>
      )}
      {maxed && (
        <p className="text-[10px] text-amber-500 font-700 mt-1 text-center">🏆 Maximum level reached!</p>
      )}
    </div>
  )
}

export default XPCard
