import DOMPurify from 'dompurify'
import { marked } from 'marked'

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const renderer = new marked.Renderer()
renderer.heading = ({ tokens, depth }) => {
  const text = tokens.map(token => token.raw || token.text || '').join('').replace(/[*_`]/g, '')
  const id = slugify(text)
  return `<h${depth} id="${id}">${marked.parseInline(text)}</h${depth}>`
}

renderer.code = ({ text, lang }) => {
  const safeText = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const language = lang ? ` language-${lang}` : ''
  return `<pre><code class="${language.trim()}" data-lang="${lang || ''}">${safeText}</code></pre>`
}

marked.use({ renderer, gfm: true, breaks: false })

export function parseDocument(document) {
  const markdown = document.markdown
  const html = DOMPurify.sanitize(marked.parse(markdown), {
    ADD_ATTR: ['target'],
  })
  return { markdown, html, toc: extractToc(markdown), mermaidBlocks: extractMermaid(markdown) }
}

export function groupBySection(docs) {
  return docs
    .filter(doc => !doc.draft)
    .reduce((groups, doc) => {
      if (!groups[doc.section]) groups[doc.section] = []
      groups[doc.section].push(doc)
      return groups
    }, {})
}

export function extractToc(markdown) {
  return markdown
    .split('\n')
    .map(line => line.match(/^(#{2,3})\s+(.+)$/))
    .filter(Boolean)
    .map(match => ({
      level: match[1].length,
      text: match[2].replace(/[*_`]/g, '').trim(),
      id: slugify(match[2].replace(/[*_`]/g, '').trim()),
    }))
}

export function extractMermaid(markdown) {
  return [...markdown.matchAll(/```mermaid\n([\s\S]*?)```/g)].map(match => match[1].trim())
}

export function searchDocs(docs, query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return docs.filter(doc => {
    const haystack = [doc.title, doc.description, doc.section, ...(doc.tags || []), doc.searchText || ''].join(' ').toLowerCase()
    return haystack.includes(q)
  })
}
