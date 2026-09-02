import { FolderKanban, Info, LogOut, Menu, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import AboutDialog from './AboutDialog'

export default function Header({ onMenu, theme, onTheme, project, user, onLogout }) {
  const [aboutOpen, setAboutOpen] = useState(false)
  return (
    <><header className="topbar">
      <button className="icon-button mobile-only" onClick={onMenu} aria-label="Abrir menú"><Menu size={20} /></button>
      <div className="topbar-title">{project.name} · {user.displayName || user.email}</div>
      <div className="topbar-actions"><Link className="icon-button" to="/" aria-label="Cambiar proyecto" title="Cambiar proyecto"><FolderKanban size={18}/></Link>{user.globalRole === 'SUPERADMIN' && <Link className="icon-button" to="/admin" aria-label="Administración global" title="Administración global"><Shield size={18}/></Link>}<button className="icon-button" onClick={() => setAboutOpen(true)} aria-label="Acerca de la wiki" title="Acerca de"><Info size={18}/></button><ThemeToggle theme={theme} onToggle={onTheme} /><button className="icon-button" onClick={onLogout} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={18} /></button></div>
    </header><AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} /></>
  )
}
