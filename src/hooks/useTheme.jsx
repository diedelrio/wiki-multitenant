import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => {
    try { const saved = localStorage.getItem('wiki-theme'); return ['light', 'dark', 'system'].includes(saved) ? saved : 'system' } catch { return 'system' }
  })
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const theme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemDark(media.matches)
    media.addEventListener('change', update)
    update()
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    try { localStorage.setItem('wiki-theme', preference) } catch {}
  }, [theme, preference])
  return <ThemeContext.Provider value={{ theme, preference, setPreference }}>{children}</ThemeContext.Provider>
}
export const useTheme = () => useContext(ThemeContext)
