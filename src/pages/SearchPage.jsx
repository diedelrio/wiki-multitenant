import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router-dom'
import { getDocuments } from '../lib/api'

export default function SearchPage() {
  const { project } = useOutletContext()
  const [params] = useSearchParams()
  const query = params.get('q') || ''
  const [results, setResults] = useState([])
  useEffect(() => { if (!query) return setResults([]); getDocuments(project.id, query).then(setResults).catch(() => setResults([])) }, [project.id, query])

  return (
    <main className="page search-page">
      <div className="section-heading"><h1>Resultados de búsqueda</h1><p>{query ? `${results.length} resultado(s) para “${query}”` : 'Escribe algo en el buscador para comenzar.'}</p></div>
      <div className="search-results">
        {results.map(doc => (
          <Link className="search-result" key={doc.slug} to={`/projects/${project.id}/docs/${encodeURIComponent(doc.slug)}`}>
            <div className="result-icon"><Search size={17} /></div>
            <div><strong>{doc.title}</strong><span>{doc.section} · {doc.description}</span><small>{doc.tags?.join(' · ')}</small></div>
          </Link>
        ))}
        {query && results.length === 0 && <div className="empty-state"><h2>Sin resultados</h2><p>Prueba con otra palabra o etiqueta.</p></div>}
      </div>
    </main>
  )
}
