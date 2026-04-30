const KEY      = 'hf_notifications'
const PREF_KEY = 'hf_notif_settings'

const formatAge = (ts) => {
  const diff  = Date.now() - ts
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month:'short', day:'numeric' })
}

const getPrefs = () => {
  try { return JSON.parse(localStorage.getItem(PREF_KEY)) || { daily:true, streaks:true, badges:true, tips:true } }
  catch { return { daily:true, streaks:true, badges:true, tips:true } }
}

// type -> pref key mapping
const TYPE_PREF = { streak:'streaks', badge:'badges', xp:'badges', tip:'tips', welcome:'daily', info:null }

export const getNotifications = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY)) || []
    return stored.map(n => ({ ...n, time: formatAge(n.ts || Date.now()) }))
  } catch { return [] }
}

export const saveNotifications = (notifs) => {
  try { localStorage.setItem(KEY, JSON.stringify(notifs)) } catch {}
}

export const pushNotification = ({ type = 'info', title, body }) => {
  // Bug 10 fix: respect user notification preferences
  const prefs   = getPrefs()
  const prefKey = TYPE_PREF[type]
  if (prefKey && prefs[prefKey] === false) return // suppressed

  const stored  = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } })()
  const newNotif = { id: Date.now(), ts: Date.now(), type, title, body, time: 'Just now', read: false }
  const updated  = [newNotif, ...stored].slice(0, 30)
  saveNotifications(updated)
  window.dispatchEvent(new CustomEvent('hf_notification', { detail: newNotif }))
}
