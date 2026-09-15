import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createProject } from '../lib/api'

export default function CreateProjectForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await createProject(form)
      setForm({ name: '', slug: '', description: '' })
      await onCreated()
      setMessage('Proyecto creado.')
    } catch (error) { setMessage(error.message) }
    finally { setBusy(false) }
  }
  return <form className="panel create-project-form" onSubmit={submit}>
    <h2><Plus size={20} aria-hidden="true" /> Crear proyecto</h2>
    <div className="create-project-fields">
      <label>Nombre<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-') })} required minLength={2} /></label>
      <label>Identificador<input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required pattern="[a-z0-9-]+" title="Letras minúsculas, números y guiones" /></label>
      <label>Descripción<input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      <button className="primary-link" disabled={busy}>{busy ? 'Creando…' : 'Crear proyecto'}</button>
    </div>
    {message && <p className="form-message" role="status">{message}</p>}
  </form>
}
