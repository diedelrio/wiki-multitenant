import AccessRequests from '../components/AccessRequests'
import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { deleteMember, getMembers, saveMember, updateMember } from '../lib/api'
export default function MembersPage({ projectOverride, userOverride, embedded = false, onChanged }) {
  const context = useOutletContext()
  const project = projectOverride || context.project; const user = userOverride || context.user;
  const Container = embedded ? 'section' : 'main'; const canManage = user.globalRole === 'SUPERADMIN' || project.role === 'ADMIN'
  const [members, setMembers] = useState([]); const [email, setEmail] = useState(''); const [role, setRole] = useState('VIEWER'); const [message, setMessage] = useState('')
  const load = () => getMembers(project.id).then(setMembers).catch(error => setMessage(error.message))
  useEffect(() => { load() }, [project.id])
  async function add(event) { event.preventDefault(); try { await saveMember(project.id, { email, role }); setEmail(''); await load(); await onChanged?.(); setMessage('Miembro guardado.') } catch (error) { setMessage(error.message) } }
  async function change(userId, nextRole) { try { await updateMember(project.id, userId, nextRole); await load(); await onChanged?.() } catch (error) { setMessage(error.message) } }
  async function remove(userId) { if (!confirm('¿Quitar este miembro?')) return; try { await deleteMember(project.id, userId); await load(); await onChanged?.() } catch (error) { setMessage(error.message) } }
  return <Container className={embedded ? "admin-page" : "page admin-page"}><div className="section-heading"><h1>Miembros</h1><p>Roles del proyecto {project.name}.</p></div>{canManage && <AccessRequests projectId={project.id} onReviewed={load} />}{canManage && <form className="panel inline-form" onSubmit={add}><input type="email" placeholder="usuario@example.com" value={email} onChange={e => setEmail(e.target.value)} required /><select value={role} onChange={e => setRole(e.target.value)}><option>VIEWER</option><option>EDITOR</option><option>ADMIN</option></select><button className="primary-link">Agregar</button></form>}<section className="panel">{members.map(member => <div className="admin-row" key={member.user.id}><div><strong>{member.user.displayName || member.user.email}</strong><small>{member.user.email}</small></div>{canManage ? <div><select value={member.role} onChange={e => change(member.user.id, e.target.value)}><option>VIEWER</option><option>EDITOR</option><option>ADMIN</option></select><button className="danger" onClick={() => remove(member.user.id)}>Quitar</button></div> : <strong>{member.role}</strong>}</div>)}{message && <p className="form-message">{message}</p>}</section></Container>
}
