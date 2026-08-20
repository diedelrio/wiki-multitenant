import { Menu } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Header({ onMenu, theme, onTheme }) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-only" onClick={onMenu} aria-label="Abrir menú"><Menu size={20} /></button>
      <div className="topbar-title">Development Hub</div>
      <div className="topbar-actions"><ThemeToggle theme={theme} onToggle={onTheme} /></div>
    </header>
  )
}
