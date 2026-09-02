import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import TableOfContents from '../components/TableOfContents'
import MermaidRenderer from '../components/MermaidRenderer'
import { parseDocument } from '../lib/content'
import { getDocument } from '../lib/api'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

function renderNonMermaid(markdown) {
  return DOMPurify.sanitize(marked.parse(markdown))
}

export default function DocumentPage() {
  const { slug = '' } = useParams()
  const { docs, theme, project } = useOutletContext()
  const decodedSlug = decodeURIComponent(slug)
  const doc = useMemo(() => docs.find(item => item.slug === decodedSlug), [docs, decodedSlug])
  const [content, setContent] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!doc) return
    setContent(null)
    setError('')
    getDocument(project.id, doc.slug).then(data => setContent(parseDocument(data))).catch(err => setError(err.message))
  }, [doc, project.id])

  if (!doc) return <main className="page"><div className="empty-state"><h1>Documento no encontrado</h1><p>El documento solicitado no existe en el índice actual.</p></div></main>
  if (error) return <main className="page"><div className="empty-state"><h1>No se pudo abrir</h1><p>{error}</p></div></main>
  if (!content) return <main className="page"><div className="loading-card">Cargando documento…</div></main>

  const parts = content.markdown.split(/```mermaid\n([\s\S]*?)```/g)

  return (
    <main className="page doc-page">
      <Breadcrumbs doc={doc} />
      <div className="doc-layout">
        <div className="doc-main">
          <header className="doc-header">
            <div className="doc-section-label">{doc.section}</div>
            <h1>{doc.title}</h1>
            <p>{doc.description}</p>
            <div className="doc-meta"><span>Actualizado {doc.updated}</span>{doc.tags?.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
          </header>
          <article className="markdown-body">
            {parts.map((part, index) => index % 2 === 1
              ? <MermaidRenderer key={index} source={part.trim()} theme={theme} />
              : part.trim() ? <div key={index} dangerouslySetInnerHTML={{ __html: renderNonMermaid(part) }} /> : null
            )}
          </article>
        </div>
        <TableOfContents items={content.toc} />
      </div>
    </main>
  )
}
