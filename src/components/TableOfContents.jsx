export default function TableOfContents({ items }) {
  if (!items?.length) return null
  return (
    <aside className="toc">
      <div className="toc-title">En esta página</div>
      {items.map(item => (
        <a key={`${item.level}-${item.id}`} className={item.level === 3 ? 'toc-level-3' : ''} href={`#${item.id}`}>{item.text}</a>
      ))}
    </aside>
  )
}
