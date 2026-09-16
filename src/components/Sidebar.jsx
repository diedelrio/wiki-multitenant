import { BookOpen, ChevronRight, FileText, Home, Search, Settings, Users, X, CircleHelp, Pin, PinOff } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { groupBySection } from '../lib/content'

export default function Sidebar({ docs = [], open, setOpen, query, setQuery, projectId, canEdit, navigation }) {
  const grouped = groupBySection(docs)
  const navigate = useNavigate()
  const [pinned, setPinned] = useState(() => {
    try { return localStorage.getItem('wiki-sidebar-pinned') === 'true' } catch { return false }
  })
  function togglePinned() {
    const next = !pinned
    setPinned(next)
    try { localStorage.setItem('wiki-sidebar-pinned', String(next)) } catch {}
  }

  function submit(event) {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/projects/${projectId}/search?q=${encodeURIComponent(value)}` : `/projects/${projectId}`)
    setOpen(false)
  }

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'visible' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''} ${pinned ? 'pinned' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><BookOpen size={18} /></div>
          <div className="brand-copy"><strong>Central WiKi</strong><span>Knowledge base</span></div>
          <button className="icon-button sidebar-pin" type="button" onClick={togglePinned} aria-pressed={pinned} aria-label={pinned ? 'Volver al modo automático' : 'Fijar barra lateral expandida'} title={pinned ? 'Volver al modo automático' : 'Fijar barra lateral expandida'}>{pinned ? <PinOff size={17} /> : <Pin size={17} />}</button>
          <button className="icon-button mobile-only" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X size={20} /></button>
        </div>

        {!navigation && <form className="search-box" onSubmit={submit}>
          <Search size={16} />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar..." aria-label="Buscar en la wiki" />
        </form>}

        <nav className="nav-scroll">
          {navigation ? navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end title={label} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={16} /><span>{label}</span>
            </NavLink>
          )) : <>
          <NavLink to={`/projects/${projectId}`} end onClick={() => setOpen(false)} className={({ isActive }) => `nav-item home-link ${isActive ? 'active' : ''}`}>
            <Home size={16} /><span>Inicio</span>
          </NavLink>
          {canEdit && <NavLink to={`/projects/${projectId}/manage`} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Settings size={16}/><span>Administrar documentos</span></NavLink>}
          <NavLink to={`/projects/${projectId}/members`} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Users size={16}/><span>Miembros</span></NavLink>

          {Object.entries(grouped).map(([section, items]) => (
            <section className="nav-section" key={section}>
              <div className="section-title">{section}</div>
              {items.map(doc => (
                <NavLink key={doc.slug} to={`/projects/${projectId}/docs/${encodeURIComponent(doc.slug)}`} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <FileText size={15} /><span>{doc.title}</span><ChevronRight className="nav-chevron" size={14} />
                </NavLink>
              ))}
            </section>
          ))}
          </>}
          <section className="nav-section"><div className="section-title">Ayuda</div><NavLink end to="/help" title="Manual de usuario" onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><CircleHelp size={16} /><span>Manual de usuario</span></NavLink><NavLink to="/help/installation" title="Instalación y mantenimiento" onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Settings size={16} /><span>Instalación y mantenimiento</span></NavLink></section>
        </nav>
      </aside>
    </>
  )
}
