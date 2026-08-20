import { useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('wiki-theme') || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('wiki-theme', theme)
  }, [theme])

  return { theme, toggleTheme: () => setTheme(value => value === 'light' ? 'dark' : 'light') }
}
