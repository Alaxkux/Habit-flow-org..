export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const isToday = (dateStr) => {
  const d = new Date(dateStr)
  const t = new Date()
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
}

export const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export const CATEGORY_COLORS = {
  health:        '#EF5350',
  fitness:       '#FF7043',
  mindfulness:   '#AB47BC',
  learning:      '#42A5F5',
  productivity:  '#FFA726',
  social:        '#26C6DA',
  other:         '#66BB6A',
}

export const CATEGORY_ICONS = {
  health:        '❤️',
  fitness:       '💪',
  mindfulness:   '🧘',
  learning:      '📚',
  productivity:  '⚡',
  social:        '👥',
  other:         '✅',
}

export const FREQUENCY_LABELS = {
  daily:    'Every day',
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  weekly:   'Once a week',
}
