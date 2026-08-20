import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Breadcrumbs({ doc }) {
  return (
    <div className="breadcrumbs">
      <Link to="/"><Home size={14} /> Inicio</Link>
      <ChevronRight size={14} />
      <span>{doc.section}</span>
      <ChevronRight size={14} />
      <strong>{doc.title}</strong>
    </div>
  )
}
