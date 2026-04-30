import { createContext, useContext, useState, useEffect } from 'react'

const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

// Full theme definitions — CSS variables applied to :root
export const THEMES = {
  forest:   { name:'Forest',         emoji:'🌲', bg:'#F0FDF4', bgDeep:'#DCFCE7', accent:'#16A34A', accentHover:'#15803D', accentLight:'#DCFCE7', accentText:'#14532D', sidebar:'#ffffff', navText:'#166534', card:'#ffffff', pageText:'#111827', subText:'#6B7280', border:'#E5E7EB', navBg:'#ffffff', dark:false },
  ocean:    { name:'Ocean',          emoji:'🌊', bg:'#EFF6FF', bgDeep:'#DBEAFE', accent:'#2563EB', accentHover:'#1D4ED8', accentLight:'#DBEAFE', accentText:'#1E3A8A', sidebar:'#ffffff', navText:'#1E40AF', card:'#ffffff', pageText:'#111827', subText:'#6B7280', border:'#E5E7EB', navBg:'#ffffff', dark:false },
  sunset:   { name:'Sunset',         emoji:'🌅', bg:'#FFF7ED', bgDeep:'#FFEDD5', accent:'#EA580C', accentHover:'#C2410C', accentLight:'#FFEDD5', accentText:'#7C2D12', sidebar:'#ffffff', navText:'#9A3412', card:'#ffffff', pageText:'#111827', subText:'#6B7280', border:'#E5E7EB', navBg:'#ffffff', dark:false },
  midnight: { name:'Midnight',       emoji:'🌙', bg:'#1E1B4B', bgDeep:'#312E81', accent:'#A78BFA', accentHover:'#8B5CF6', accentLight:'#312E81', accentText:'#EDE9FE', sidebar:'#13113A', navText:'#C4B5FD', card:'#2D2B6B', pageText:'#E0E7FF', subText:'#A5B4FC', border:'#3730A3', navBg:'#13113A', dark:true },
  cherry:   { name:'Cherry Blossom', emoji:'🌸', bg:'#FFF1F2', bgDeep:'#FFE4E6', accent:'#E11D48', accentHover:'#BE123C', accentLight:'#FFE4E6', accentText:'#881337', sidebar:'#ffffff', navText:'#9F1239', card:'#ffffff', pageText:'#111827', subText:'#6B7280', border:'#FECDD3', navBg:'#ffffff', dark:false },
  aurora:   { name:'Aurora',         emoji:'✨', bg:'#F0FDF9', bgDeep:'#CCFBF1', accent:'#0D9488', accentHover:'#0F766E', accentLight:'#CCFBF1', accentText:'#134E4A', sidebar:'#ffffff', navText:'#0F766E', card:'#ffffff', pageText:'#111827', subText:'#6B7280', border:'#99F6E4', navBg:'#ffffff', dark:false },
  desert:   { name:'Desert',         emoji:'🏜️', bg:'#FFFBEB', bgDeep:'#FEF3C7', accent:'#D97706', accentHover:'#B45309', accentLight:'#FEF3C7', accentText:'#78350F', sidebar:'#ffffff', navText:'#92400E', card:'#ffffff', pageText:'#111827', subText:'#6B7280', border:'#FDE68A', navBg:'#ffffff', dark:false },
  lavender: { name:'Lavender',       emoji:'💜', bg:'#FAF5FF', bgDeep:'#EDE9FE', accent:'#7C3AED', accentHover:'#6D28D9', accentLight:'#EDE9FE', accentText:'#4C1D95', sidebar:'#ffffff', navText:'#5B21B6', card:'#ffffff', pageText:'#111827', subText:'#6B7280', border:'#DDD6FE', navBg:'#ffffff', dark:false },
  champion: { name:'Champion',       emoji:'🏆', bg:'#1C1917', bgDeep:'#292524', accent:'#F59E0B', accentHover:'#D97706', accentLight:'#292524', accentText:'#FEF3C7', sidebar:'#0C0A09', navText:'#FCD34D', card:'#292524', pageText:'#FEF3C7', subText:'#D6D3D1', border:'#44403C', navBg:'#0C0A09', dark:true },
}

const CSS_VARS = (t) => ({
  '--color-bg':           t.bg,
  '--color-bg-deep':      t.bgDeep,
  '--color-accent':       t.accent,
  '--color-accent-hover': t.accentHover,
  '--color-accent-light': t.accentLight,
  '--color-accent-text':  t.accentText,
  '--color-sidebar':      t.sidebar,
  '--color-nav-text':     t.navText,
  '--color-card':         t.card,
  '--color-page-text':    t.pageText,
  '--color-sub-text':     t.subText,
  '--color-border':       t.border,
  '--color-nav-bg':       t.navBg,
})

const applyTheme = (themeId) => {
  const t = THEMES[themeId] || THEMES.forest
  const root = document.documentElement
  Object.entries(CSS_VARS(t)).forEach(([k, v]) => root.style.setProperty(k, v))
  // dark mode class for midnight/champion
  if (t.dark) root.classList.add('theme-dark')
  else root.classList.remove('theme-dark')
}

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [activeTheme, setActiveThemeState] = useState(() => lsGet('hf_active_theme', 'forest'))

  useEffect(() => { applyTheme(activeTheme) }, [activeTheme])

  // Listen for theme changes from XPStore (cross-component)
  useEffect(() => {
    const handler = (e) => {
      setActiveThemeState(e.detail)
      applyTheme(e.detail)
    }
    window.addEventListener('hf_theme_change', handler)
    return () => window.removeEventListener('hf_theme_change', handler)
  }, [])

  const setTheme = (id) => {
    lsSet('hf_active_theme', id)
    setActiveThemeState(id)
    applyTheme(id)
    window.dispatchEvent(new CustomEvent('hf_theme_change', { detail: id }))
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
