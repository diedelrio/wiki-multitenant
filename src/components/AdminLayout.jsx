import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BellRing, FolderKanban, Settings, Users } from 'lucide-react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useTheme } from '../hooks/useTheme'

export default function AdminLayout({ user, projects, onLogout }) {
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()
  const navigation = [{ to: '/', label: 'Mis proyectos', icon: FolderKanban }]
  if (user.globalRole === 'SUPERADMIN' || projects.some(project => project.role === 'ADMIN')) {
    navigation.push({ to: '/admin/requests', label: 'Solicitudes pendientes', icon: BellRing })
    navigation.push({ to: '/admin/members', label: 'Usuarios por proyecto', icon: Users })
  }
  if (user.globalRole === 'SUPERADMIN') navigation.push(
    { to: '/admin/users', label: 'Administración de usuarios', icon: Users },
    { to: '/admin/projects', label: 'Administración de proyectos', icon: Settings },
  )
  return <div className="app-shell">
    <Sidebar open={open} setOpen={setOpen} navigation={navigation} />
    <div className="main-shell">
      <Header onMenu={() => setOpen(true)} theme={theme} project={{ name: 'Central WiKi' }} user={user} onLogout={onLogout} />
      <Outlet />
    </div>
  </div>
}
