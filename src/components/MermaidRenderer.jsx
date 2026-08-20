import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

export default function MermaidRenderer({ source, theme }) {
  const ref = useRef(null)

  useEffect(() => {
    let cancelled = false
    const id = `mermaid-${Math.random().toString(36).slice(2)}`
    mermaid.initialize({ startOnLoad: false, theme: theme === 'dark' ? 'dark' : 'default', securityLevel: 'strict' })
    mermaid.render(id, source).then(({ svg }) => {
      if (!cancelled && ref.current) ref.current.innerHTML = svg
    }).catch(() => {
      if (!cancelled && ref.current) ref.current.textContent = source
    })
    return () => { cancelled = true }
  }, [source, theme])

  return <div className="mermaid-render" ref={ref} />
}
