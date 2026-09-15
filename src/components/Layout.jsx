import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { useTheme } from '../hooks/useTheme'

export default function Layout({ docs, query, setQuery, project, user, onLogout, refreshDocs }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme } = useTheme()

  return (
    <div className="app-shell">
      <Sidebar docs={docs} open={sidebarOpen} setOpen={setSidebarOpen} query={query} setQuery={setQuery} projectId={project.id} canEdit={user.globalRole === 'SUPERADMIN' || ['ADMIN', 'EDITOR'].includes(project.role)} />
      <div className="main-shell">
        <Header onMenu={() => setSidebarOpen(true)} theme={theme} project={project} user={user} onLogout={onLogout} />
        <Outlet context={{ docs, theme, project, user, refreshDocs }} />
      </div>
    </div>
  )
}
