import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function ProjectSubscriptions({ projects, accessRequests, refreshSession }) {
  const [catalog, setCatalog] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const available = catalog.filter(project => !projects.some(item => item.id === project.id) && !accessRequests.some(request => request.project.id === project.id))
  async function load() {
    setLoading(true)
    try { setCatalog(await api('/auth/projects')) } catch (err) { setMessage(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      await api('/access-requests', { method: 'POST', body: JSON.stringify({ projectIds: selected.filter(id => available.some(project => project.id === id)) }) })
      setSelected([])
      await refreshSession()
      setMessage('Solicitudes enviadas. El administrador de cada proyecto revisará tu acceso.')
    } catch (err) { setMessage(err.message) }
    finally { setBusy(false) }
  }
  return <form className="panel" onSubmit={submit}>
    <h2>Solicitar acceso a proyectos</h2><p>Selecciona uno o varios proyectos. Cada solicitud se aprueba por separado.</p>
    {loading ? <p role="status">Cargando proyectos…</p> : available.map(project => <label className="subscription-option" key={project.id}>
      <input type="checkbox" checked={selected.includes(project.id)} disabled={busy} onChange={event => setSelected(current => event.target.checked ? [...current, project.id] : current.filter(id => id !== project.id))} />{project.name}
    </label>)}
    {!loading && !available.length && <p>No hay nuevos proyectos disponibles para solicitar acceso.</p>}
    <div className="form-actions"><button className="primary-link" disabled={busy || loading || !selected.length}>{busy ? 'Enviando…' : 'Solicitar acceso'}</button><button type="button" disabled={busy} onClick={load}>Actualizar proyectos</button></div>
    {message && <p className="form-message" role="status">{message}</p>}
  </form>
}
