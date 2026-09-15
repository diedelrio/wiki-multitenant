import ThemeToggle from '../components/ThemeToggle'
import { BookOpen } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { register } from '../lib/api'

export default function RegisterPage({ session, onRegister }) {
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  if (session) return <Navigate to="/" replace />
  async function submit(event) {
    event.preventDefault(); setError('')
    if (form.displayName.trim().length < 2 || form.displayName.trim().length > 80) return setError('El nombre debe tener entre 2 y 80 caracteres.')
    if (form.password.length < 10 || form.password.length > 128) return setError('La contraseña debe tener entre 10 y 128 caracteres.')
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden.')
    setBusy(true)
    try { await register({ displayName: form.displayName.trim(), email: form.email.trim(), password: form.password }); await onRegister() }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <main className="login-page"><div className="login-theme"><ThemeToggle /></div><form className="login-card" onSubmit={submit}><div className="login-brand"><BookOpen size={22} aria-hidden="true" /><span>Central WiKi</span></div><header className="login-heading"><h1>Crear cuenta</h1><p>Crea tu cuenta. Una vez dentro podrás solicitar acceso a uno o varios proyectos.</p></header><label>Nombre<input autoComplete="name" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} required minLength={2} maxLength={80} /></label><label>Email<input type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label><label>Contraseña (mínimo 10 caracteres)<input type="password" autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={10} maxLength={128} /></label><label>Repetir contraseña<input type="password" autoComplete="new-password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required minLength={10} maxLength={128} /></label>{error && <div className="login-error" role="alert">{error}</div>}<button className="primary-link" disabled={busy}>{busy ? 'Creando…' : 'Crear cuenta'}</button><p className="login-footer">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p><p className="login-footer"><Link to="/help">Ayuda: Manual de usuario</Link></p></form></main>
}
