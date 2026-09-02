import { BookOpen, CalendarDays, Code2, Tag, X } from 'lucide-react'
import { useEffect } from 'react'

export default function AboutDialog({ open, onClose }) {
  useEffect(() => { if (!open) return undefined; const close = event => { if (event.key === 'Escape') onClose() }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [open, onClose])
  if (!open) return null
  const updated = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(__BUILD_DATE__))
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section className="about-dialog" role="dialog" aria-modal="true" aria-labelledby="about-title"><button className="icon-button about-close" onClick={onClose} aria-label="Cerrar"><X size={19}/></button><div className="about-brand"><div className="about-logo"><BookOpen size={28}/></div><div><span>Development knowledge base</span><h2 id="about-title">ServiFix Wiki</h2></div></div><p className="about-description">{__APP_DESCRIPTION__}</p><dl className="about-details"><div><dt><Tag size={16}/>Versión</dt><dd>v{__APP_VERSION__}</dd></div><div><dt><CalendarDays size={16}/>Última actualización</dt><dd>{updated}</dd></div><div><dt><Code2 size={16}/>Tecnología</dt><dd>React · Node.js · PostgreSQL · Prisma</dd></div></dl><footer>Wiki multitenant · RBAC · Documentación Markdown</footer></section></div>
}
