import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { register } from '../lib/api'

export default function RegisterPage({ session, onRegister }) {
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  if (session) return <Navigate to="/" replace />
  async function submit(event) {
    event.preventDefault(); setError('')
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden.')
    setBusy(true)
    try { await register({ displayName: form.displayName, email: form.email, password: form.password }); await onRegister() }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <main className="login-page"><form className="login-card" onSubmit={submit}><h1>Crear cuenta</h1><p>Se creará una wiki personal donde serás ADMIN.</p><label>Nombre<input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} required minLength={2} /></label><label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label><label>Contraseña<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={10} /></label><label>Repetir contraseña<input type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required minLength={10} /></label>{error && <div className="login-error">{error}</div>}<button className="primary-link" disabled={busy}>{busy ? 'Creando…' : 'Crear cuenta'}</button><Link to="/login">Ya tengo una cuenta</Link></form></main>
}
