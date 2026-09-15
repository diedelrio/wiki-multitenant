import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { Link, useMatch } from 'react-router-dom'
import { BellRing } from 'lucide-react'
import { api } from '../lib/api'

const PendingRequestsContext = createContext(null)
export const usePendingRequests = () => useContext(PendingRequestsContext)

export default function PendingRequestsProvider({ session, children }) {
  const onRequestsPage = useMatch('/admin/requests')
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const sequence = useRef(0)
  const canManage = session?.user.globalRole === 'SUPERADMIN' || session?.projects.some(project => project.role === 'ADMIN')
  const userId = session?.user.id
  const refresh = useCallback(async () => {
    const current = ++sequence.current
    if (!canManage) { setRequests([]); setError(''); setLoading(false); return }
    try {
      const next = await api('/access-requests/pending')
      if (current === sequence.current) { setRequests(next); setError('') }
    } catch (err) { if (current === sequence.current) setError(err.message) }
    finally { if (current === sequence.current) setLoading(false) }
  }, [canManage, userId])
  useEffect(() => {
    setRequests([]); setLoading(true)
    refresh()
    const interval = canManage ? setInterval(refresh, 30000) : null
    window.addEventListener('access-requests-reviewed', refresh)
    window.addEventListener('focus', refresh)
    return () => { ++sequence.current; clearInterval(interval); window.removeEventListener('access-requests-reviewed', refresh); window.removeEventListener('focus', refresh) }
  }, [refresh, canManage])
  return <PendingRequestsContext.Provider value={{ requests, error, loading, refresh, canManage }}>
    {children}
    {canManage && requests.length > 0 && !onRequestsPage && <aside className="pending-popup" aria-label="Solicitudes pendientes">
      <BellRing size={22} aria-hidden="true" />
      <div><strong role="status">Tienes {requests.length} solicitud(es) de acceso pendientes</strong><p>Aprueba o rechaza las solicitudes para resolver este aviso.</p><Link className="primary-link" to="/admin/requests">Revisar solicitudes</Link></div>
    </aside>}
  </PendingRequestsContext.Provider>
}
