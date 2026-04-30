import { createContext, useContext, useState, useEffect } from 'react'

const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

const parseDuration = (d) => {
  if (!d || d === 'once') return null
  if (d.endsWith('h')) return parseInt(d) * 3600000
  if (d.endsWith('d')) return parseInt(d) * 86400000
  return 86400000
}

const PowerUpContext = createContext()

export const PowerUpProvider = ({ children }) => {
  const [owned, setOwned] = useState(() => lsGet('hf_owned_powerups', []))
  const [perks, setPerks] = useState(() => lsGet('hf_owned_perks', []))

  // Clean expired powerups on load
  useEffect(() => {
    const now = Date.now()
    const valid = owned.filter(o => !o.expiresAt || o.expiresAt > now)
    if (valid.length !== owned.length) { setOwned(valid); lsSet('hf_owned_powerups', valid) }
  }, [])

  const isActive = (id) => {
    const p = owned.find(o => o.id === id)
    if (!p) return false
    if (!p.expiresAt) return true
    return Date.now() < p.expiresAt
  }

  const hasPerk = (id) => perks.includes(id)

  const activate = (id, duration) => {
    const exp = parseDuration(duration)
    const next = [...owned.filter(o => o.id !== id), { id, expiresAt: exp ? Date.now() + exp : null }]
    setOwned(next); lsSet('hf_owned_powerups', next)
  }

  const unlockPerk = (id) => {
    if (!perks.includes(id)) {
      const next = [...perks, id]; setPerks(next); lsSet('hf_owned_perks', next)
    }
  }

  const refresh = () => {
    setOwned(lsGet('hf_owned_powerups', []))
    setPerks(lsGet('hf_owned_perks', []))
  }

  // XP multiplier from active powerups
  const getXPMultiplier = () => {
    let mult = 1
    if (isActive('xp_boost'))  mult += 0.5
    if (isActive('double_day')) mult = 2
    if (isActive('xp_rain'))   mult += 0.25
    return mult
  }

  // Confetti duration multiplier
  const getConfetiDuration = () => hasPerk('confetti_plus') ? 5000 : 3000

  return (
    <PowerUpContext.Provider value={{ owned, perks, isActive, hasPerk, activate, unlockPerk, refresh, getXPMultiplier, getConfetiDuration }}>
      {children}
    </PowerUpContext.Provider>
  )
}

export const usePowerUp = () => useContext(PowerUpContext)
