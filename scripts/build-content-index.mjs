import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const contentDir = path.join(root, 'content')
const publicDir = path.join(root, 'public')
const outputContentDir = path.join(publicDir, 'content')

const sectionLabels = {
  '00-home': 'Inicio',
  '01-product': 'Producto',
  '02-functional': 'Funcional',
  '03-architecture': 'Arquitectura',
  '04-backlog': 'Backlog',
  '05-testing': 'QA y Testing',
  '06-decisions': 'Decisiones',
}

function parseFrontmatter(source) {
  if (!source.startsWith('---\n')) return { data: {}, body: source }
  const end = source.indexOf('\n---\n', 4)
  if (end === -1) return { data: {}, body: source }

  const raw = source.slice(4, end)
  const body = source.slice(end + 5)
  const data = {}

  for (const line of raw.split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()

    if (/^\[.*\]$/.test(value)) {
      value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^['\"]|['\"]$/g, '')).filter(Boolean)
    } else if (/^(true|false)$/i.test(value)) {
      value = value.toLowerCase() === 'true'
    } else if (/^-?\d+(\.\d+)?$/.test(value)) {
      value = Number(value)
    } else {
      value = value.replace(/^['\"]|['\"]$/g, '')
    }
    data[key] = value
  }

  return { data, body }
}

function firstHeading(body) {
  const match = body.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim()
}

function firstParagraph(body) {
  const blocks = body
    .replace(/^#{1,6}\s+.*$/gm, '')
    .split(/\n\s*\n/)
    .map(v => v.trim())
    .filter(v => v && !v.startsWith('```') && !v.startsWith('|'))
  return blocks[0]?.replace(/[*_`>#-]/g, '').trim()
}

function slugFrom(relative) {
  return relative
    .replace(/\\/g, '/')
    .replace(/\.md$/i, '')
    .replace(/\/README$/i, '')
    .split('/')
    .map(part => part.replace(/^\d+-/, ''))
    .filter(Boolean)
    .join('--') || 'home'
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await walk(full))
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) files.push(full)
  }
  return files
}

await fs.mkdir(outputContentDir, { recursive: true })
await fs.rm(outputContentDir, { recursive: true, force: true })
await fs.mkdir(outputContentDir, { recursive: true })

const files = await walk(contentDir)
const docs = []

for (const file of files) {
  const relative = path.relative(contentDir, file)
  const normalized = relative.replace(/\\/g, '/')
  const [sectionFolder] = normalized.split('/')
  const source = await fs.readFile(file, 'utf8')
  const { data, body } = parseFrontmatter(source)
  const target = path.join(outputContentDir, normalized)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, body, 'utf8')

  const stat = await fs.stat(file)
  const title = data.title || firstHeading(body) || path.basename(file, '.md')
  const description = data.description || firstParagraph(body) || 'Documento de la wiki.'

  docs.push({
    slug: data.slug || slugFrom(normalized),
    title,
    description,
    section: data.section || sectionLabels[sectionFolder] || sectionFolder.replace(/^\d+-/, ''),
    sectionOrder: Number(sectionFolder.match(/^\d+/)?.[0] ?? 99),
    order: Number(data.order ?? 999),
    tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
    updated: data.updated || stat.mtime.toISOString().slice(0, 10),
    draft: Boolean(data.draft),
    path: `/content/${normalized}`,
    sourcePath: normalized,
    searchText: body.replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`|\[\]()!-]/g, ' ').replace(/\s+/g, ' ').trim(),
  })
}

docs.sort((a, b) => a.sectionOrder - b.sectionOrder || a.order - b.order || a.title.localeCompare(b.title, 'es'))
await fs.writeFile(path.join(publicDir, 'content-index.json'), JSON.stringify(docs, null, 2))
console.log(`Índice generado: ${docs.length} documentos`)
