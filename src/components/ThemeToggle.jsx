import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { preference, setPreference } = useTheme()
  const Icon = preference === 'system' ? Monitor : preference === 'dark' ? Moon : Sun
  return <label className="theme-selector" title="Tema de la aplicaci?n">
    <Icon size={16} aria-hidden="true" />
    <select aria-label="Tema de la aplicaci?n" value={preference} onChange={event => setPreference(event.target.value)}>
      <option value="light">Claro</option><option value="dark">Oscuro</option><option value="system">Sistema</option>
    </select>
  </label>
}
