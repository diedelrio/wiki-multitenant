import { ArrowRight, BookOpen, FileText, Layers3, Search } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import { groupBySection } from '../lib/content'

export default function HomePage() {
  const { docs, project } = useOutletContext()
  const visibleDocs = docs.filter(doc => !doc.draft && doc.slug !== 'home')
  const sections = Object.entries(groupBySection(visibleDocs))
  const recent = [...visibleDocs].sort((a, b) => String(b.updated).localeCompare(String(a.updated))).slice(0, 5)

  return (
    <main className="page home-page">
      <section className="hero">
        <div className="eyebrow"><BookOpen size={15} /> Development knowledge base</div>
        <h1>Todo el conocimiento del proyecto, en un solo lugar.</h1>
        <p>Documentación funcional, arquitectura, backlog, decisiones y testing escritos en Markdown y navegables como una wiki moderna.</p>
        <Link className="primary-link" to={visibleDocs[0] ? `/projects/${project.id}/docs/${encodeURIComponent(visibleDocs[0].slug)}` : `/projects/${project.id}`}>Explorar documentación <ArrowRight size={17} /></Link>
      </section>

      <section className="stat-grid">
        <div className="stat-card"><FileText /><strong>{visibleDocs.length}</strong><span>Documentos</span></div>
        <div className="stat-card"><Layers3 /><strong>{sections.length}</strong><span>Secciones</span></div>
        <div className="stat-card"><Search /><strong>Instantánea</strong><span>Búsqueda por metadatos</span></div>
      </section>

      <section className="content-section">
        <div className="section-heading"><h2>Áreas de conocimiento</h2><p>Navega por la estructura documental del proyecto.</p></div>
        <div className="section-grid">
          {sections.map(([section, items]) => (
            <div className="section-card" key={section}>
              <div className="section-card-top"><h3>{section}</h3><span>{items.length}</span></div>
              {items.slice(0, 3).map(doc => <Link key={doc.slug} to={`/projects/${project.id}/docs/${encodeURIComponent(doc.slug)}`}>{doc.title}<ArrowRight size={14} /></Link>)}
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading"><h2>Actualizados recientemente</h2></div>
        <div className="recent-list">
          {recent.map(doc => (
            <Link key={doc.slug} to={`/projects/${project.id}/docs/${encodeURIComponent(doc.slug)}`} className="recent-row">
              <div><strong>{doc.title}</strong><span>{doc.section} · {doc.description}</span></div><time>{doc.updated}</time>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
