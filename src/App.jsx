import HelpPage from './pages/HelpPage'
import PendingRequestsProvider from './components/PendingRequestsProvider'
import PendingRequestsPage from './pages/PendingRequestsPage'
import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import HomePage from './pages/HomePage'
import DocumentPage from './pages/DocumentPage'
import SearchPage from './pages/SearchPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProjectsPage from './pages/ProjectsPage'
import ManageDocumentsPage from './pages/ManageDocumentsPage'
import MembersPage from './pages/MembersPage'
import ProjectMembersPage from './pages/ProjectMembersPage'
import AdminPage from './pages/AdminPage'
import { getDocuments, getSession, logout } from './lib/api'

function ProjectShell({ session, query, setQuery, onLogout }) {
  const { projectId } = useParams()
  const project = session.projects.find(item => item.id === projectId)
  const [docs, setDocs] = useState([])
  const [status, setStatus] = useState('loading')
  async function refreshDocs() {
    setStatus('loading')
    try { setDocs(await getDocuments(projectId)); setStatus('ready') } catch { setStatus('error') }
  }
  useEffect(() => {
    refreshDocs()
  }, [projectId])
  if (!project) return <Navigate to="/" replace />
  if (status === 'loading') return <div className="boot-screen">Cargando proyecto…</div>
  if (status === 'error') return <div className="boot-screen">No se pudo cargar el proyecto.</div>
  return <Layout docs={docs} query={query} setQuery={setQuery} project={project} user={session.user} onLogout={onLogout} refreshDocs={refreshDocs} />
}

export default function App() {
  const [session, setSession] = useState(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    getSession().then(setSession).catch(() => {}).finally(() => setStatus('ready'))
    const expired = () => setSession(null)
    window.addEventListener('session-expired', expired)
    return () => window.removeEventListener('session-expired', expired)
  }, [])

  async function handleLogout() { try { await logout() } finally { setSession(null); setQuery('') } }

  if (status === 'loading') return <div className="boot-screen">Cargando Central WiKi…</div>
  return (
    <PendingRequestsProvider session={session}><Routes>
      <Route path="/login" element={<LoginPage session={session} onLogin={async () => setSession(await getSession())} />} />
      <Route path="/register" element={<RegisterPage session={session} onRegister={async () => setSession(await getSession())} />} />
      {!session ? <><Route path="/help" element={<HelpPage />} /><Route path="/help/installation" element={<HelpPage />} /><Route path="*" element={<Navigate to="/login" replace />} /></> : <>
        <Route element={<AdminLayout projects={session.projects} user={session.user} onLogout={handleLogout} />}>
          <Route path="/help" element={<HelpPage />} /><Route path="/help/installation" element={<HelpPage />} />
          <Route path="/" element={<ProjectsPage accessRequests={session.accessRequests} projects={session.projects} user={session.user} refreshSession={async () => setSession(await getSession())} />} />
          <Route path="/admin" element={<Navigate to={session.user.globalRole === 'SUPERADMIN' ? '/admin/projects' : '/'} replace />} />
          <Route path="/admin/requests" element={<PendingRequestsPage />} />
          <Route path="/admin/members" element={<ProjectMembersPage user={session.user} refreshSession={async () => setSession(await getSession())} />} />
          <Route path="/admin/users" element={<AdminPage key="users" section="users" session={session} refreshSession={async () => setSession(await getSession())} />} />
          <Route path="/admin/projects" element={<AdminPage key="projects" section="projects" session={session} refreshSession={async () => setSession(await getSession())} />} />
        </Route>
        <Route path="/projects/:projectId" element={<ProjectShell session={session} query={query} setQuery={setQuery} onLogout={handleLogout} />}>
          <Route index element={<HomePage />} />
          <Route path="docs/:slug" element={<DocumentPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="manage" element={<ManageDocumentsPage />} />
          <Route path="members" element={<MembersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </>}
    </Routes></PendingRequestsProvider>
  )
}
