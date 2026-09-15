import { useEffect, useState } from 'react'
import { getMembershipProjects } from '../lib/api'
import MembersPage from './MembersPage'

export default function ProjectMembersPage({ user, refreshSession }) {
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  async function load() {
    try {
      const next = await getMembershipProjects()
      setProjects(next)
      setSelectedId(current => next.some(project => project.id === current) ? current : next[0]?.id || '')
      setStatus('ready')
    } catch (err) { setError(err.message); setStatus('error') }
  }
  useEffect(() => { load() }, [])
  const project = projects.find(item => item.id === selectedId)
  return <main className="page admin-page">
    <div className="section-heading"><h1>Usuarios por proyecto</h1><p>{user.globalRole === 'SUPERADMIN' ? 'Gestiona las asignaciones de todos los proyectos.' : 'Gestiona los usuarios de los proyectos donde eres ADMIN.'}</p></div>
    {status === 'loading' && <p role="status">Cargando proyectos…</p>}
    {status === 'error' && <div className="panel" role="alert">{error}<button onClick={load}>Reintentar</button></div>}
    {status === 'ready' && (projects.length ? <>
      <div className="panel"><label>Proyecto <select value={selectedId} onChange={event => setSelectedId(event.target.value)}>{projects.map(item => <option key={item.id} value={item.id}>{item.name}{item.archivedAt ? ' (archivado)' : item.blockedAt ? ' (bloqueado)' : ''}</option>)}</select></label></div>
      {project && <MembersPage key={project.id} projectOverride={{ ...project, role: 'ADMIN' }} userOverride={user} embedded onChanged={async () => { await refreshSession(); await load() }} />}
    </> : <div className="panel">No tienes proyectos para administrar.</div>)}
  </main>
}
