import { useState } from 'react'
import { api } from '../lib/api'

export default function DefaultProjectPreference({ projects, user, refreshSession }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const current = projects.some(project => project.id === user.defaultProjectId) ? user.defaultProjectId : ''
  async function change(value) {
    setBusy(true); setMessage('')
    try {
      await api('/auth/preferences', { method: 'PATCH', body: JSON.stringify({ defaultProjectId: value || null }) })
      await refreshSession()
      setMessage('Preferencia guardada para tu próximo inicio de sesión.')
    } catch (err) { setMessage(err.message) }
    finally { setBusy(false) }
  }
  return <section className="panel"><h2>Proyecto de inicio</h2>
    <p>Elige el proyecto que se abrirá al iniciar sesión. Puedes cambiarlo cuando quieras desde Mis proyectos.</p>
    <label>Al iniciar sesión <select value={current} disabled={busy} onChange={event => change(event.target.value)}>
      <option value="">Mostrar Mis proyectos</option>
      {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
    </select></label>
    {user.defaultProjectId && !current && <p>Tu proyecto de inicio ya no está disponible. Elige otro o guarda «Mostrar Mis proyectos».</p>}
    {user.defaultProjectId && !current && <button onClick={() => change('')} disabled={busy}>Quitar preferencia anterior</button>}
    {message && <p role="status" className="form-message">{message}</p>}
  </section>
}
