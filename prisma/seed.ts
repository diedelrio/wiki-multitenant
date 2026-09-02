import fs from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const root = process.cwd()

async function main() {
  const password = process.env.SEED_SUPERADMIN_PASSWORD || 'Admin123!'
  const passwordHash = await bcrypt.hash(password, 12)
  const admin = await prisma.user.upsert({
    where: { email: process.env.SEED_SUPERADMIN_EMAIL || 'admin@example.com' },
    update: { passwordHash, globalRole: 'SUPERADMIN' },
    create: { email: process.env.SEED_SUPERADMIN_EMAIL || 'admin@example.com', displayName: 'Super Admin', passwordHash, globalRole: 'SUPERADMIN' },
  })
  const editor = await prisma.user.upsert({ where: { email: 'editor@example.com' }, update: { passwordHash }, create: { email: 'editor@example.com', displayName: 'Editor Demo', passwordHash } })
  const viewer = await prisma.user.upsert({ where: { email: 'viewer@example.com' }, update: { passwordHash }, create: { email: 'viewer@example.com', displayName: 'Viewer Demo', passwordHash } })
  const project = await prisma.project.upsert({ where: { slug: 'servifix' }, update: {}, create: { slug: 'servifix', name: 'ServiFix Wiki', description: 'Documentación principal de ServiFix' } })
  const privateProject = await prisma.project.upsert({ where: { slug: 'tenant-privado' }, update: {}, create: { slug: 'tenant-privado', name: 'Tenant privado', description: 'Proyecto para comprobar el aislamiento' } })
  for (const [userId, role] of [[editor.id, 'EDITOR'], [viewer.id, 'VIEWER']] as const) await prisma.projectMembership.upsert({ where: { projectId_userId: { projectId: project.id, userId } }, update: { role }, create: { projectId: project.id, userId, role } })
  await prisma.projectMembership.upsert({ where: { projectId_userId: { projectId: privateProject.id, userId: admin.id } }, update: { role: 'ADMIN' }, create: { projectId: privateProject.id, userId: admin.id, role: 'ADMIN' } })

  const index = JSON.parse(await fs.readFile(path.join(root, 'public', 'content-index.json'), 'utf8'))
  for (const item of index) {
    const markdown = await fs.readFile(path.join(root, 'public', item.path.replace(/^\//, '')), 'utf8')
    await prisma.document.upsert({
      where: { projectId_slug: { projectId: project.id, slug: item.slug } },
      update: { title: item.title, description: item.description, section: item.section, sectionOrder: item.sectionOrder, sortOrder: item.order, tags: item.tags, markdown, searchText: item.searchText, status: item.draft ? 'DRAFT' : 'PUBLISHED', updatedById: admin.id },
      create: { projectId: project.id, slug: item.slug, title: item.title, description: item.description, section: item.section, sectionOrder: item.sectionOrder, sortOrder: item.order, tags: item.tags, markdown, searchText: item.searchText, status: item.draft ? 'DRAFT' : 'PUBLISHED', createdById: admin.id, updatedById: admin.id },
    })
  }
  await prisma.document.upsert({ where: { projectId_slug: { projectId: privateProject.id, slug: 'secreto' } }, update: {}, create: { projectId: privateProject.id, slug: 'secreto', title: 'Documento aislado', section: 'Privado', tags: ['seguridad'], markdown: '# Documento aislado\n\nEste contenido pertenece únicamente al segundo tenant.', searchText: 'Documento aislado contenido segundo tenant', status: 'PUBLISHED', createdById: admin.id, updatedById: admin.id } })
  console.log(`Seed listo. Usuarios admin/editor/viewer con contraseña ${password}`)
}

main().finally(() => prisma.$disconnect())
