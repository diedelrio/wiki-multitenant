import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../lib/api'
import { usePendingRequests } from '../components/PendingRequestsProvider'

export default function PendingRequestsPage() {
  const { requests, error, loading, refresh, canManage } = usePendingRequests()
  const [busy, setBusy] = useState(null)
  const [message, setMessage] = useState('')
  if (!canManage) return <Navigate to="/" replace />
  async function review(request, status) {
    setBusy(request.id); setMessage('')
    try {
      await api(`/projects/${request.project.id}/access-requests/${request.id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setMessage(status === 'APPROVED' ? 'Solicitud aprobada. El usuario tiene acceso como VIEWER.' : 'Solicitud rechazada.')
    } catch (err) { setMessage(err.message) }
    finally { await refresh(); setBusy(null) }
  }
  return <main className="page admin-page pending-requests-page">
    <div className="section-heading admin-heading"><div><h1>Solicitudes pendientes</h1><p>Revisa el acceso a los proyectos que administras.</p></div><button className="primary-link" onClick={refresh} disabled={busy !== null}>Actualizar</button></div>
    {loading && <p role="status">Cargando solicitudes…</p>}
    {error && <p role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
    {!loading && !error && !requests.length && <section className="panel"><h2>Todo al día</h2><p>No quedan solicitudes pendientes.</p></section>}
    {requests.map(request => <section className="panel" key={request.id}>
      <h2>{request.project.name}</h2><div className="admin-row admin-user-row"><div><strong>{request.user.displayName || request.user.email}</strong><small>{request.user.email}</small><small>Solicitado: {new Date(request.createdAt).toLocaleString('es-ES')}</small></div>
        <div><button disabled={busy !== null} onClick={() => review(request, 'APPROVED')}>Aprobar</button><button className="danger" disabled={busy !== null} onClick={() => review(request, 'REJECTED')}>Rechazar</button></div></div>
    </section>)}
  </main>
}
