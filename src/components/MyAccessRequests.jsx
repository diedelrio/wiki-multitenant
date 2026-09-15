import { useState } from 'react'
import { api } from '../lib/api'

export default function MyAccessRequests({ requests, refreshSession }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const visible = requests.filter(request => request.status !== 'APPROVED')
  async function act(request, action) {
    setBusy(true); setMessage('')
    try {
      if (action === 'cancel') await api(`/access-requests/${request.id}`, { method: 'DELETE' })
      if (action === 'retry') await api(`/access-requests/${request.id}/retry`, { method: 'POST' })
      await refreshSession()
      window.dispatchEvent(new Event('access-requests-reviewed'))
      setMessage(action === 'cancel' ? 'Pedido cancelado. Puedes solicitar acceso de nuevo desde el listado de proyectos.' : action === 'retry' ? 'Solicitud enviada de nuevo. Queda pendiente de revisión.' : 'Estado actualizado.')
    } catch (err) { setMessage(err.message) }
    finally { setBusy(false) }
  }
  return <section className="my-access-requests">
    {visible.length > 0 && <><h2>Mis solicitudes de acceso</h2><div className="section-grid">
      {visible.map(request => <article className="panel request-card" key={request.id}>
        <h3>{request.project.name}</h3><span className="tag">{request.status === 'REJECTED' ? 'Rechazada' : 'Pendiente'}</span>
        <p>{request.status === 'REJECTED' ? 'No fuiste aceptado en el proyecto. Puedes volver a solicitar acceso.' : 'Tu solicitud está pendiente de aprobación.'}</p>
        <div className="form-actions"><button disabled={busy} onClick={() => act(request, 'refresh')}>Actualizar</button><button className="danger" disabled={busy} onClick={() => act(request, 'cancel')}>Cancelar pedido</button><button disabled={busy || request.status !== 'REJECTED'} title={request.status === 'PENDING' ? 'Ya tienes una solicitud pendiente' : 'Enviar una nueva solicitud de acceso'} onClick={() => act(request, 'retry')}>Volver a solicitar</button></div>
      </article>)}
    </div></>}
    {message && <p className="form-message" role="status">{message}</p>}
  </section>
}
