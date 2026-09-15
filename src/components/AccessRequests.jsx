import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function AccessRequests({ projectId, onReviewed }) {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const path = `/projects/${projectId}/access-requests`
  async function load() { try { setRequests(await api(path)) } catch (err) { setError(err.message) } }
  useEffect(() => { load() }, [projectId])
  async function review(id, status) {
    setBusy(true); setError('')
    try {
      await api(`${path}/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      window.dispatchEvent(new Event('access-requests-reviewed'))
      await load(); await onReviewed()
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return <section className="panel"><h2>Solicitudes de acceso</h2>
    <p>Al aprobar, el usuario obtiene acceso como VIEWER. Después puedes cambiar su rol.</p>
    {requests.map(request => <div className="admin-row admin-user-row" key={request.id}>
      <div><strong>{request.user.displayName}</strong><small>{request.user.email}</small></div>
      <div><button disabled={busy} onClick={() => review(request.id, 'APPROVED')}>Aprobar</button><button className="danger" disabled={busy} onClick={() => review(request.id, 'REJECTED')}>Rechazar</button></div>
    </div>)}
    {!requests.length && !error && <p>No hay solicitudes pendientes.</p>}
    {error && <p role="alert">{error}</p>}
  </section>
}
