const KEY = 'hf_notifications'

export const getNotifications = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

export const saveNotifications = (n) => {
  try { localStorage.setItem(KEY, JSON.stringify(n)) } catch {}
}

export const pushNotification = ({ type = 'info', title, body }) => {
  const notifs = getNotifications()
  const newNotif = {
    id: Date.now(),
    type,
    title,
    body,
    time: 'Just now',
    read: false,
  }
  const updated = [newNotif, ...notifs].slice(0, 30) // max 30
  saveNotifications(updated)
  // Dispatch event so Navbar re-reads
  window.dispatchEvent(new CustomEvent('hf_notification', { detail: newNotif }))
}
