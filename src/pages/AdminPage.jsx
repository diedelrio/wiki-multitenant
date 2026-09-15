import CreateProjectForm from '../components/CreateProjectForm'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { deleteAdminProject, getAdminProjects, getAdminUsers, resetUserPassword, updateAdminProject, updateAdminUser } from '../lib/api'

export default function AdminPage({ session, refreshSession, section = 'projects' }) {
  const [users, setUsers] = useState([]); const [projects, setProjects] = useState([]); const [message, setMessage] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  async function load() { try { const [nextUsers, nextProjects] = await Promise.all([getAdminUsers(), getAdminProjects()]); setUsers(nextUsers); setProjects(nextProjects) } catch (error) { setMessage(error.message) } }
  useEffect(() => { if (session.user.globalRole === 'SUPERADMIN') load() }, [session.user.globalRole])
  async function userChange(id, data) { try { await updateAdminUser(id, data); await load(); await refreshSession() } catch (error) { setMessage(error.message) } }
  async function reset(id) { if (!confirm('Se cerrarán todas las sesiones del usuario. ¿Continuar?')) return; try { const result = await resetUserPassword(id); setMessage(`Contraseña temporal: ${result.temporaryPassword}`) } catch (error) { setMessage(error.message) } }
  async function projectChange(id, data) { try { await updateAdminProject(id, data); await load(); await refreshSession() } catch (error) { setMessage(error.message) } }
  async function removeProject(project) {
    if (deletingId) return
    const slug = window.prompt(`Vas a eliminar definitivamente el proyecto "${project.name}", sus ${project._count.documents} documentos y sus ${project._count.memberships} membresías. Las cuentas de usuario se conservan. Esta acción no se puede deshacer. Escribe "${project.slug}" para confirmar:`)
    if (slug === null) return
    if (slug !== project.slug) { setMessage('El identificador no coincide. No se ha eliminado el proyecto.'); return }
    setDeletingId(project.id)
    setMessage('')
    try {
      await deleteAdminProject(project.id, slug)
      setProjects(current => current.filter(item => item.id !== project.id))
      await refreshSession()
      setMessage(`Proyecto "${project.name}" eliminado definitivamente.`)
      await load()
    } catch (error) { setMessage(error.message) }
    finally { setDeletingId(null) }
  }
  if (session.user.globalRole !== 'SUPERADMIN') return <Navigate to="/" replace />
  return <main className="page admin-page"><div className="section-heading admin-heading"><div><h1>{section === 'users' ? 'Administración de usuarios' : 'Administración de proyectos'}</h1><p>{section === 'users' ? 'Gestiona los perfiles y el acceso a la plataforma.' : 'Crea proyectos y gestiona su disponibilidad.'}</p></div></div>{section === 'projects' && <CreateProjectForm onCreated={async () => { await refreshSession(); await load() }} />}{message && <div className="panel form-message admin-message">{message}</div>}{section === 'users' && <section className="panel"><h2>Usuarios</h2>{users.map(item => <div className="admin-row admin-user-row" key={item.id}><div><strong>{item.displayName || item.email}</strong><small>{item.email} · {item.memberships.length} proyecto(s){item.disabledAt ? ' · BLOQUEADO' : ''}</small></div><div><select value={item.globalRole} onChange={e => userChange(item.id, { globalRole: e.target.value })}><option value="USER">USER</option><option value="SUPERADMIN">SUPERADMIN</option></select><button onClick={() => userChange(item.id, { blocked: !item.disabledAt })}>{item.disabledAt ? 'Desbloquear' : 'Bloquear'}</button><button onClick={() => reset(item.id)}>Blanquear clave</button></div></div>)}</section>}{section === 'projects' && <section className="panel"><h2>Proyectos</h2>{projects.map(project => <div className="admin-row admin-user-row" key={project.id}><div><strong>{project.name}</strong><small>{project.slug} · {project._count.memberships} miembros · {project._count.documents} documentos{project.archivedAt ? ' · ARCHIVADO' : project.blockedAt ? ' · BLOQUEADO' : project.isReadOnly ? ' · SOLO LECTURA' : ''}</small></div><div><button disabled={Boolean(project.archivedAt) || deletingId !== null} onClick={() => projectChange(project.id, { isReadOnly: !project.isReadOnly })}>{project.isReadOnly ? 'Permitir edición' : 'Solo lectura'}</button><button disabled={Boolean(project.archivedAt) || deletingId !== null} onClick={() => projectChange(project.id, { blocked: !project.blockedAt })}>{project.blockedAt ? 'Desbloquear' : 'Bloquear'}</button><button disabled={deletingId !== null} onClick={() => projectChange(project.id, { archived: !project.archivedAt })}>{project.archivedAt ? 'Reactivar' : 'Archivar'}</button><button className="danger" disabled={deletingId !== null} onClick={() => removeProject(project)}>{deletingId === project.id ? 'Eliminando...' : 'Eliminar definitivamente'}</button></div></div>)}</section>}</main>
}
