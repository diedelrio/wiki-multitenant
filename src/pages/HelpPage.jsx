import { Link, NavLink, useLocation } from 'react-router-dom'
import { parseDocument } from '../lib/content'
import manual from '../../docs/manual-usuario.md?raw'
import manualUrl from '../../docs/manual-usuario.md?url'
import installation from '../../docs/instalacion.md?raw'
import installationUrl from '../../docs/instalacion.md?url'

const userGuide = parseDocument({ markdown: manual })
const installationGuide = parseDocument({ markdown: installation })

export default function HelpPage() {
  const { pathname } = useLocation()
  const isInstallation = pathname.replace(/\/$/, '') === '/help/installation'
  const { html, toc } = isInstallation ? installationGuide : userGuide
  return <main className="page help-page">
    <div className="section-heading admin-heading"><div><h1>Ayuda</h1><p>{isInstallation ? 'Guía de instalación y mantenimiento' : 'Manual de usuario de Central WiKi'}</p></div><div className="form-actions"><a className="primary-link" href={isInstallation ? installationUrl : manualUrl} download={isInstallation ? 'instalacion.md' : 'manual-usuario.md'}>Descargar guía</a><Link to="/">Volver a la wiki</Link></div></div>
    <nav className="panel form-actions" aria-label="Guías de ayuda"><NavLink end to="/help" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Manual de usuario</NavLink><NavLink to="/help/installation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Instalación y mantenimiento</NavLink></nav>
    <nav className="panel help-index" aria-label="Índice de la guía"><h2>Contenido</h2><ul>{toc.filter(item => item.level === 2).map(item => <li key={item.id}><a href={`#${item.id}`}>{item.text}</a></li>)}</ul></nav>
    <article className="panel markdown-body help-content" dangerouslySetInnerHTML={{ __html: html }} />
  </main>
}
