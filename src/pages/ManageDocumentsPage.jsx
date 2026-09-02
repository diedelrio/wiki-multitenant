import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { createDocument, deleteDocument, getDocument, updateDocument } from '../lib/api'

const empty = { slug: '', title: '', description: '', section: 'General', tags: '', status: 'DRAFT', markdown: '# Nuevo documento\n' }
function slugify(value) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
function readMarkdownFile(source, filename) {
  const result = { ...empty, slug: slugify(filename.replace(/\.md$/i, '')), title: filename.replace(/\.md$/i, '') }
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { ...result, markdown: source }
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':'); if (separator < 0) continue
    const key = line.slice(0, separator).trim(); const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key === 'title') result.title = value
    if (key === 'description') result.description = value
    if (key === 'section') result.section = value
    if (key === 'slug') result.slug = slugify(value)
    if (key === 'tags') result.tags = value.replace(/^\[|\]$/g, '').split(',').map(tag => tag.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean).join(', ')
    if (key === 'status' && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(value.toUpperCase())) result.status = value.toUpperCase()
  }
  result.markdown = match[2]
  return result
}
export default function ManageDocumentsPage() {
  const { docs, project, user, refreshDocs } = useOutletContext()
  const canEdit = user.globalRole === 'SUPERADMIN' || ['ADMIN', 'EDITOR'].includes(project.role)
  const canDelete = user.globalRole === 'SUPERADMIN' || project.role === 'ADMIN'
  const [form, setForm] = useState(empty); const [editingId, setEditingId] = useState(null); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { if (!editingId) setForm(empty) }, [editingId])
  if (!canEdit) return <main className="page"><div className="empty-state"><h1>Solo lectura</h1><p>Tu rol no permite modificar documentos.</p></div></main>
  async function edit(doc) { setMessage(''); const full = await getDocument(project.id, doc.slug); setEditingId(doc.id); setForm({ slug: doc.slug, title: full.title, description: full.description || '', section: full.section, tags: full.tags.join(', '), status: full.status, markdown: full.markdown }) }
  async function upload(event) {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.md')) return setMessage('Selecciona un archivo con extensión .md.')
    if (file.size > 1_500_000) return setMessage('El archivo supera el límite de 1.5 MB.')
    try { setEditingId(null); setForm(readMarkdownFile(await file.text(), file.name)); setMessage('Archivo cargado. Revisa los datos y pulsa Guardar.') } catch { setMessage('No se pudo leer el archivo.') }
  }
  async function submit(event) { event.preventDefault(); setBusy(true); setMessage(''); const data = { ...form, tags: form.tags.split(',').map(v => v.trim()).filter(Boolean) }; try { if (editingId) await updateDocument(project.id, editingId, data); else await createDocument(project.id, data); await refreshDocs(); setEditingId(null); setForm(empty); setMessage('Documento guardado.') } catch (error) { setMessage(error.message) } finally { setBusy(false) } }
  async function remove(doc) { if (!confirm(`¿Eliminar “${doc.title}”?`)) return; try { await deleteDocument(project.id, doc.id); await refreshDocs(); if (editingId === doc.id) setEditingId(null) } catch (error) { setMessage(error.message) } }
  return <main className="page admin-page"><div className="section-heading"><h1>Administrar documentos</h1><p>{project.name}</p></div><div className="admin-grid"><section className="panel"><h2>Documentos</h2>{docs.map(doc => <div className="admin-row" key={doc.id}><div><strong>{doc.title}</strong><small>{doc.section} · {doc.status}</small></div><div><button onClick={() => edit(doc)}>Editar</button>{canDelete && <button className="danger" onClick={() => remove(doc)}>Eliminar</button>}</div></div>)}</section><form className="panel editor-form" onSubmit={submit}><h2>{editingId ? 'Editar documento' : 'Nuevo documento'}</h2>{!editingId && <label className="upload-control">Importar archivo .md<input type="file" accept=".md,text/markdown" onChange={upload} /></label>}<label>Título<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></label><label>Slug<input value={form.slug} disabled={Boolean(editingId)} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} required /></label><label>Sección<input value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} required /></label><label>Descripción<input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label><label>Etiquetas separadas por coma<input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></label><label>Estado<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="DRAFT">Borrador</option><option value="PUBLISHED">Publicado</option><option value="ARCHIVED">Archivado</option></select></label><label>Markdown<textarea rows="18" value={form.markdown} onChange={e => setForm({ ...form, markdown: e.target.value })} /></label>{message && <p className="form-message">{message}</p>}<div className="form-actions"><button className="primary-link" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>{editingId && <button type="button" onClick={() => setEditingId(null)}>Cancelar</button>}</div></form></div></main>
}
