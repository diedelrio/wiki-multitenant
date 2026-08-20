import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { useTheme } from '../hooks/useTheme'

export default function Layout({ docs, query, setQuery }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="app-shell">
      <Sidebar docs={docs} open={sidebarOpen} setOpen={setSidebarOpen} query={query} setQuery={setQuery} />
      <div className="main-shell">
        <Header onMenu={() => setSidebarOpen(true)} theme={theme} onTheme={toggleTheme} />
        <Outlet context={{ docs, theme }} />
      </div>
    </div>
  )
}
