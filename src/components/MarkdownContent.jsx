import MermaidRenderer from './MermaidRenderer'

export default function MarkdownContent({ html, markdown, theme }) {
  const parts = markdown.split(/```mermaid\n([\s\S]*?)```/g)
  const hasMermaid = parts.length > 1

  if (!hasMermaid) return <article className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />

  return (
    <article className="markdown-body">
      {parts.map((part, index) => {
        if (index % 2 === 1) return <MermaidRenderer key={index} source={part.trim()} theme={theme} />
        return part.trim() ? <div key={index} dangerouslySetInnerHTML={{ __html: window.DOMPurify ? window.DOMPurify.sanitize(part) : part }} /> : null
      })}
    </article>
  )
}
