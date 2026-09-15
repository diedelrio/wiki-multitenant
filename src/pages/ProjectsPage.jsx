import MyAccessRequests from '../components/MyAccessRequests'
import ProjectSubscriptions from '../components/ProjectSubscriptions'
import DefaultProjectPreference from '../components/DefaultProjectPreference'
import { Link } from 'react-router-dom'
import CreateProjectForm from '../components/CreateProjectForm'

export default function ProjectsPage({ projects, user, refreshSession, accessRequests = [] }) {
  return <main className="page admin-page">
    <div className="section-heading admin-heading"><div><h1>Mis proyectos</h1><p>Selecciona un proyecto para consultar su wiki.</p></div></div>
    {user.globalRole === 'SUPERADMIN' && <CreateProjectForm onCreated={refreshSession} />}
    <DefaultProjectPreference projects={projects} user={user} refreshSession={refreshSession} />
    <div className="section-grid">{projects.map(project => <Link className="section-card" key={project.id} to={`/projects/${project.id}`}><h3>{project.name}</h3><p>{project.description}</p><small>{project.role || 'SUPERADMIN'}{project.isReadOnly ? ' · SOLO LECTURA' : ''}</small></Link>)}</div>
    {user.globalRole !== 'SUPERADMIN' && <ProjectSubscriptions projects={projects} accessRequests={accessRequests} refreshSession={refreshSession} />}
    <MyAccessRequests requests={accessRequests} refreshSession={refreshSession} />
    {projects.length === 0 && accessRequests.length === 0 && <div className="panel">Todavía no hay proyectos disponibles.</div>}
  </main>
}
