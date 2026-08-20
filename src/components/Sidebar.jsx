import { BookOpen, ChevronRight, FileText, Home, Search, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { groupBySection } from '../lib/content'

export default function Sidebar({ docs, open, setOpen, query, setQuery }) {
  const grouped = groupBySection(docs)
  const navigate = useNavigate()

  function submit(event) {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/search?q=${encodeURIComponent(value)}` : '/')
    setOpen(false)
  }

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'visible' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><BookOpen size={18} /></div>
          <div className="brand-copy"><strong>ServiFix Wiki</strong><span>Knowledge base</span></div>
          <button className="icon-button mobile-only" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X size={20} /></button>
        </div>

        <form className="search-box" onSubmit={submit}>
          <Search size={16} />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar..." aria-label="Buscar en la wiki" />
        </form>

        <nav className="nav-scroll">
          <NavLink to="/" end onClick={() => setOpen(false)} className={({ isActive }) => `nav-item home-link ${isActive ? 'active' : ''}`}>
            <Home size={16} /><span>Inicio</span>
          </NavLink>

          {Object.entries(grouped).map(([section, items]) => (
            <section className="nav-section" key={section}>
              <div className="section-title">{section}</div>
              {items.map(doc => (
                <NavLink key={doc.slug} to={`/docs/${encodeURIComponent(doc.slug)}`} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <FileText size={15} /><span>{doc.title}</span><ChevronRight className="nav-chevron" size={14} />
                </NavLink>
              ))}
            </section>
          ))}
        </nav>
      </aside>
    </>
  )
}
