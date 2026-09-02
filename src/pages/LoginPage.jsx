import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { login } from '../lib/api'
export default function LoginPage({ session, onLogin }) {
  const [email, setEmail] = useState('admin@example.com'); const [password, setPassword] = useState('Admin123!'); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  if (session) return <Navigate to="/" replace />
  async function submit(event) { event.preventDefault(); setBusy(true); setError(''); try { await login(email, password); await onLogin() } catch (err) { setError(err.message) } finally { setBusy(false) } }
  return <main className="login-page"><form className="login-card" onSubmit={submit}><h1>Acceso a la wiki</h1><p>Inicia sesión para ver tus proyectos.</p><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></label>{error && <div className="login-error">{error}</div>}<button className="primary-link" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button><Link to="/register">Crear una cuenta</Link></form></main>
}
