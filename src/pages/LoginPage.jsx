import ThemeToggle from '../components/ThemeToggle'
import { BookOpen } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { login } from '../lib/api'
export default function LoginPage({ session, onLogin }) {
  const [email, setEmail] = useState('admin@example.com'); const [password, setPassword] = useState('Admin123!'); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  if (session) {
    const preferred = session.projects.find(project => project.id === session.user.defaultProjectId)
    return <Navigate to={preferred ? `/projects/${preferred.id}` : '/'} replace />
  }
  async function submit(event) { event.preventDefault(); setBusy(true); setError(''); try { await login(email, password); await onLogin() } catch (err) { setError(err.message) } finally { setBusy(false) } }
  return <main className="login-page"><div className="login-theme"><ThemeToggle /></div><form className="login-card" onSubmit={submit}><div className="login-brand"><BookOpen size={22} aria-hidden="true" /><span>Central WiKi</span></div><header className="login-heading"><h1>Acceso a la wiki</h1><p>Inicia sesión para ver tus proyectos.</p></header><label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Contraseña<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></label>{error && <div className="login-error" role="alert">{error}</div>}<button className="primary-link" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button><p className="login-footer">¿Aún no tienes cuenta? <Link to="/register">Crear una cuenta</Link></p><p className="login-footer"><Link to="/help">Ayuda: Manual de usuario</Link></p></form></main>
}
