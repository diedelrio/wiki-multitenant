import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import { PrismaClient, type GlobalRole, type ProjectRole } from '@prisma/client'
import { z } from 'zod'

const env = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3000),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  SESSION_TTL_HOURS: z.coerce.number().positive().default(168),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
}).parse(process.env)

const prisma = new PrismaClient()
const app = express()
const SESSION_COOKIE = 'wiki_session'
type Auth = { userId: string; globalRole: GlobalRole; projectId?: string; projectRole?: ProjectRole; projectReadOnly?: boolean }
type AuthedRequest = Request & { auth?: Auth }
type Permission = 'document:read' | 'document:draft' | 'document:write' | 'document:delete' | 'member:read' | 'member:manage'
const permissions: Record<ProjectRole, Set<Permission>> = {
  VIEWER: new Set(['document:read', 'member:read']),
  EDITOR: new Set(['document:read', 'document:draft', 'document:write', 'member:read']),
  ADMIN: new Set(['document:read', 'document:draft', 'document:write', 'document:delete', 'member:read', 'member:manage']),
}

class HttpError extends Error { constructor(public status: number, message: string) { super(message) } }
const route = (handler: (req: AuthedRequest, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => { void handler(req as AuthedRequest, res, next).catch(next) }

app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())

const authenticate = route(async (req, _res, next) => {
  const token = req.cookies?.[SESSION_COOKIE]
  if (!token) throw new HttpError(401, 'Sesión requerida')
  const session = await prisma.session.findUnique({ where: { id: token }, include: { user: true } })
  if (!session || session.expiresAt <= new Date() || session.user.disabledAt) throw new HttpError(401, 'Sesión inválida o vencida')
  req.auth = { userId: session.userId, globalRole: session.user.globalRole }
  next()
})

const projectAccess = route(async (req, _res, next) => {
  const project = await prisma.project.findUnique({ where: { id: String(req.params.projectId) } })
  if (!project) throw new HttpError(404, 'Proyecto no encontrado')
  const superadminMembers = req.auth!.globalRole === 'SUPERADMIN' && /^\/(?:members|access-requests)(?:\/|$)/.test(req.path)
  if ((project.archivedAt || project.blockedAt) && !superadminMembers) throw new HttpError(423, project.archivedAt ? 'Proyecto eliminado' : 'Proyecto bloqueado')
  const membership = await prisma.projectMembership.findUnique({
    where: { projectId_userId: { projectId: project.id, userId: req.auth!.userId } },
  })
  if (!membership && req.auth!.globalRole !== 'SUPERADMIN') throw new HttpError(404, 'Proyecto no encontrado')
  req.auth = { ...req.auth!, projectId: project.id, projectRole: membership?.role, projectReadOnly: project.isReadOnly }
  next()
})

const requirePermission = (permission: Permission) => (req: Request, _res: Response, next: NextFunction) => {
  const auth = (req as AuthedRequest).auth!
  if (auth.projectReadOnly && ['document:write', 'document:delete'].includes(permission)) return next(new HttpError(423, 'El proyecto está en modo solo lectura'))
  if (auth.globalRole === 'SUPERADMIN' || (auth.projectRole && permissions[auth.projectRole].has(permission))) return next()
  next(new HttpError(403, 'Permiso insuficiente'))
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.get('/api/membership-projects', authenticate, route(async (req, res) => {
  const projects = await prisma.project.findMany({
    where: req.auth!.globalRole === 'SUPERADMIN' ? {} : {
      archivedAt: null, blockedAt: null,
      memberships: { some: { userId: req.auth!.userId, role: 'ADMIN' } },
    },
    select: { id: true, name: true, slug: true, archivedAt: true, blockedAt: true },
    orderBy: { name: 'asc' },
  })
  res.json(projects)
}))

async function startSession(userId: string, res: Response) {
  const id = crypto.randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 3_600_000)
  await prisma.session.create({ data: { id, userId, expiresAt } })
  res.cookie(SESSION_COOKIE, id, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', expires: expiresAt, path: '/' })
}

app.post('/api/auth/login', route(async (req, res) => {
  const input = z.object({ email: z.string().email(), password: z.string().min(8) }).parse(req.body)
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })
  if (!user || user.disabledAt || !(await bcrypt.compare(input.password, user.passwordHash))) throw new HttpError(401, 'Credenciales inválidas')
  await startSession(user.id, res)
  res.status(204).end()
}))

app.get('/api/auth/projects', authenticate, route(async (_req, res) => {
  res.json(await prisma.project.findMany({ where: { archivedAt: null, blockedAt: null }, select: { id: true, name: true }, orderBy: { name: 'asc' } }))
}))

app.post('/api/access-requests', authenticate, route(async (req, res) => {
  const { projectIds } = z.object({ projectIds: z.array(z.string().uuid()).min(1).max(100) }).parse(req.body)
  const ids = [...new Set(projectIds)]
  await prisma.$transaction(async tx => {
    const projects = await tx.project.findMany({ where: { id: { in: ids }, archivedAt: null, blockedAt: null }, select: { id: true } })
    if (projects.length !== ids.length) throw new HttpError(404, 'Alguno de los proyectos no esta disponible')
    const memberships = await tx.projectMembership.findMany({ where: { userId: req.auth!.userId, projectId: { in: ids } }, select: { projectId: true } })
    const existing = new Set(memberships.map(member => member.projectId))
    await tx.projectAccessRequest.createMany({ data: ids.filter(id => !existing.has(id)).map(projectId => ({ projectId, userId: req.auth!.userId })), skipDuplicates: true })
  })
  res.status(204).end()
}))

app.delete('/api/access-requests/:requestId', authenticate, route(async (req, res) => {
  const result = await prisma.projectAccessRequest.deleteMany({ where: {
    id: String(req.params.requestId), userId: req.auth!.userId, status: { in: ['PENDING', 'REJECTED'] },
  } })
  if (!result.count) throw new HttpError(409, 'La solicitud ya no se puede cancelar. Actualiza su estado.')
  res.status(204).end()
}))

app.post('/api/access-requests/:requestId/retry', authenticate, route(async (req, res) => {
  const result = await prisma.projectAccessRequest.updateMany({ where: {
    id: String(req.params.requestId), userId: req.auth!.userId, status: 'REJECTED',
    project: { archivedAt: null, blockedAt: null, memberships: { none: { userId: req.auth!.userId } } },
  }, data: { status: 'PENDING', reviewedAt: null, createdAt: new Date() } })
  if (!result.count) throw new HttpError(409, 'No se puede reenviar esta solicitud. Actualiza su estado y comprueba que el proyecto siga disponible.')
  res.status(204).end()
}))

app.get('/api/access-requests/pending', authenticate, route(async (req, res) => {
  res.json(await prisma.projectAccessRequest.findMany({
    where: {
      status: 'PENDING', user: { globalRole: 'USER' },
      ...(req.auth!.globalRole === 'SUPERADMIN' ? {} : { project: {
        archivedAt: null, blockedAt: null,
        memberships: { some: { userId: req.auth!.userId, role: 'ADMIN' } },
      } }),
    },
    select: { id: true, createdAt: true, project: { select: { id: true, name: true } }, user: { select: { displayName: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  }))
}))

app.post('/api/auth/register', route(async (req, res) => {
  const input = z.object({
    email: z.string().trim().email('Introduce un email válido.'),
    password: z.string().min(10, 'La contraseña debe tener al menos 10 caracteres.').max(128, 'La contraseña no puede superar los 128 caracteres.'),
    displayName: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(80, 'El nombre no puede superar los 80 caracteres.'),
  }).parse(req.body)
  const email = input.email.toLowerCase()
  if (await prisma.user.findUnique({ where: { email } })) throw new HttpError(409, 'Ya existe un usuario con ese email')
  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await prisma.user.create({ data: { email, displayName: input.displayName, passwordHash } })
  await startSession(user.id, res)
  res.status(201).json({ id: user.id })
}))

app.post('/api/auth/logout', authenticate, route(async (req, res) => {
  await prisma.session.deleteMany({ where: { id: req.cookies?.[SESSION_COOKIE], userId: req.auth!.userId } })
  res.clearCookie(SESSION_COOKIE, { path: '/' }).status(204).end()
}))

app.patch('/api/auth/preferences', authenticate, route(async (req, res) => {
  const { defaultProjectId } = z.object({ defaultProjectId: z.string().uuid().nullable() }).parse(req.body)
  if (defaultProjectId) {
    const project = await prisma.project.findFirst({ where: {
      id: defaultProjectId, archivedAt: null, blockedAt: null,
      ...(req.auth!.globalRole === 'SUPERADMIN' ? {} : { memberships: { some: { userId: req.auth!.userId } } }),
    } })
    if (!project) throw new HttpError(404, 'Proyecto no disponible o sin acceso')
  }
  await prisma.user.update({ where: { id: req.auth!.userId }, data: { defaultProjectId } })
  res.status(204).end()
}))

app.get('/api/auth/session', authenticate, route(async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.auth!.userId },
    select: { id: true, email: true, displayName: true, globalRole: true, defaultProjectId: true },
  })
  const projects = await prisma.project.findMany({
    where: req.auth!.globalRole === 'SUPERADMIN' ? { archivedAt: null, blockedAt: null } : { archivedAt: null, blockedAt: null, memberships: { some: { userId: user.id } } },
    select: { id: true, slug: true, name: true, description: true, isReadOnly: true, memberships: { where: { userId: user.id }, select: { role: true } } },
    orderBy: { name: 'asc' },
  })
  const accessRequests = await prisma.projectAccessRequest.findMany({ where: { userId: user.id }, select: { id: true, status: true, project: { select: { id: true, name: true } } } })
  res.json({ user, accessRequests, projects: projects.map(({ memberships, ...project }) => ({ ...project, role: memberships[0]?.role ?? null })) })
}))

app.get('/api/projects', authenticate, route(async (req, res) => {
  const projects = await prisma.project.findMany({
    where: req.auth!.globalRole === 'SUPERADMIN' ? { archivedAt: null, blockedAt: null } : { archivedAt: null, blockedAt: null, memberships: { some: { userId: req.auth!.userId } } },
    orderBy: { name: 'asc' },
  })
  res.json(projects)
}))

app.post('/api/projects', authenticate, route(async (req, res) => {
  if (req.auth!.globalRole !== 'SUPERADMIN') throw new HttpError(403, 'Solo SUPERADMIN puede crear proyectos')
  const input = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), name: z.string().min(2), description: z.string().optional() }).parse(req.body)
  const project = await prisma.project.create({ data: { ...input, memberships: { create: { userId: req.auth!.userId, role: 'ADMIN' } } } })
  res.status(201).json(project)
}))

const requireSuperadmin = (req: Request, _res: Response, next: NextFunction) => {
  if ((req as AuthedRequest).auth?.globalRole !== 'SUPERADMIN') return next(new HttpError(403, 'Solo SUPERADMIN'))
  next()
}

app.get('/api/admin/users', authenticate, requireSuperadmin, route(async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, displayName: true, globalRole: true, disabledAt: true, createdAt: true, memberships: { select: { role: true, project: { select: { id: true, name: true, archivedAt: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(users)
}))

async function ensureNotLastSuperadmin(userId: string, demoting: boolean) {
  if (!demoting) return
  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) throw new HttpError(404, 'Usuario no encontrado')
  if (target.globalRole === 'SUPERADMIN' && !target.disabledAt) {
    const active = await prisma.user.count({ where: { globalRole: 'SUPERADMIN', disabledAt: null } })
    if (active <= 1) throw new HttpError(409, 'Debe existir al menos un SUPERADMIN activo')
  }
}

app.patch('/api/admin/users/:userId', authenticate, requireSuperadmin, route(async (req, res) => {
  const input = z.object({ globalRole: z.enum(['USER', 'SUPERADMIN']).optional(), blocked: z.boolean().optional() }).refine(value => value.globalRole !== undefined || value.blocked !== undefined, 'Sin cambios').parse(req.body)
  const userId = String(req.params.userId)
  const current = await prisma.user.findUnique({ where: { id: userId } })
  if (!current) throw new HttpError(404, 'Usuario no encontrado')
  await ensureNotLastSuperadmin(userId, input.globalRole === 'USER' || input.blocked === true)
  const user = await prisma.user.update({ where: { id: userId }, data: { ...(input.globalRole ? { globalRole: input.globalRole } : {}), ...(input.blocked !== undefined ? { disabledAt: input.blocked ? new Date() : null } : {}) }, select: { id: true, email: true, displayName: true, globalRole: true, disabledAt: true } })
  if (input.blocked) await prisma.session.deleteMany({ where: { userId } })
  res.json(user)
}))

app.post('/api/admin/users/:userId/reset-password', authenticate, requireSuperadmin, route(async (req, res) => {
  const userId = String(req.params.userId)
  if (!await prisma.user.findUnique({ where: { id: userId } })) throw new HttpError(404, 'Usuario no encontrado')
  const temporaryPassword = `Tmp-${crypto.randomBytes(9).toString('base64url')}!`
  await prisma.$transaction([prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(temporaryPassword, 12) } }), prisma.session.deleteMany({ where: { userId } })])
  res.json({ temporaryPassword })
}))

app.get('/api/admin/projects', authenticate, requireSuperadmin, route(async (_req, res) => {
  res.json(await prisma.project.findMany({ include: { _count: { select: { memberships: true, documents: true } } }, orderBy: { createdAt: 'desc' } }))
}))

app.patch('/api/admin/projects/:projectId', authenticate, requireSuperadmin, route(async (req, res) => {
  const input = z.object({ isReadOnly: z.boolean().optional(), blocked: z.boolean().optional(), archived: z.boolean().optional() }).refine(value => Object.keys(value).length > 0, 'Sin cambios').parse(req.body)
  const projectId = String(req.params.projectId)
  if (!await prisma.project.findUnique({ where: { id: projectId } })) throw new HttpError(404, 'Proyecto no encontrado')
  res.json(await prisma.project.update({ where: { id: projectId }, data: { ...(input.isReadOnly !== undefined ? { isReadOnly: input.isReadOnly } : {}), ...(input.blocked !== undefined ? { blockedAt: input.blocked ? new Date() : null } : {}), ...(input.archived !== undefined ? { archivedAt: input.archived ? new Date() : null } : {}) } }))
}))

app.delete('/api/admin/projects/:projectId', authenticate, requireSuperadmin, route(async (req, res) => {
  const projectId = String(req.params.projectId)
  const { slug } = z.object({ slug: z.string().min(1) }).parse(req.body)
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new HttpError(404, 'Proyecto no encontrado')
  if (slug !== project.slug) throw new HttpError(400, 'El identificador no coincide con el proyecto')
  const result = await prisma.project.deleteMany({ where: { id: projectId, slug } })
  if (!result.count) throw new HttpError(404, 'Proyecto no encontrado')
  res.status(204).end()
}))

app.use('/api/projects/:projectId', authenticate, projectAccess)

app.get('/api/projects/:projectId/documents', requirePermission('document:read'), route(async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  const canDraft = req.auth!.globalRole === 'SUPERADMIN' || (req.auth!.projectRole && permissions[req.auth!.projectRole].has('document:draft'))
  const documents = await prisma.document.findMany({
    where: { projectId: req.auth!.projectId!, status: canDraft ? { not: 'ARCHIVED' } : 'PUBLISHED', ...(q ? { OR: ['title', 'description', 'searchText'].map(field => ({ [field]: { contains: q, mode: 'insensitive' } })) } : {}) },
    select: { id: true, slug: true, title: true, description: true, section: true, sectionOrder: true, sortOrder: true, tags: true, status: true, updatedAt: true },
    orderBy: [{ sectionOrder: 'asc' }, { sortOrder: 'asc' }, { title: 'asc' }],
  })
  res.json(documents)
}))

app.get('/api/projects/:projectId/documents/:slug', requirePermission('document:read'), route(async (req, res) => {
  const canDraft = req.auth!.globalRole === 'SUPERADMIN' || (req.auth!.projectRole && permissions[req.auth!.projectRole].has('document:draft'))
  const document = await prisma.document.findFirst({ where: { projectId: req.auth!.projectId!, slug: String(req.params.slug), status: canDraft ? { not: 'ARCHIVED' } : 'PUBLISHED' } })
  if (!document) throw new HttpError(404, 'Documento no encontrado')
  res.json(document)
}))

app.post('/api/projects/:projectId/documents', requirePermission('document:write'), route(async (req, res) => {
  const input = z.object({ slug: z.string().min(1), title: z.string().min(1), description: z.string().optional(), section: z.string().min(1), markdown: z.string(), tags: z.array(z.string()).default([]), status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT') }).parse(req.body)
  res.status(201).json(await prisma.document.create({ data: { ...input, projectId: req.auth!.projectId!, searchText: input.markdown, createdById: req.auth!.userId, updatedById: req.auth!.userId } }))
}))

app.patch('/api/projects/:projectId/documents/:documentId', requirePermission('document:write'), route(async (req, res) => {
  const existing = await prisma.document.findFirst({ where: { id: String(req.params.documentId), projectId: req.auth!.projectId! } })
  if (!existing) throw new HttpError(404, 'Documento no encontrado')
  const input = z.object({ title: z.string().min(1).optional(), description: z.string().nullable().optional(), section: z.string().min(1).optional(), markdown: z.string().optional(), tags: z.array(z.string()).optional(), status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional() }).parse(req.body)
  res.json(await prisma.document.update({ where: { id: existing.id }, data: { ...input, ...(input.markdown !== undefined ? { searchText: input.markdown } : {}), updatedById: req.auth!.userId } }))
}))

app.delete('/api/projects/:projectId/documents/:documentId', requirePermission('document:delete'), route(async (req, res) => {
  const result = await prisma.document.deleteMany({ where: { id: String(req.params.documentId), projectId: req.auth!.projectId! } })
  if (!result.count) throw new HttpError(404, 'Documento no encontrado')
  res.status(204).end()
}))

app.get('/api/projects/:projectId/access-requests', requirePermission('member:manage'), route(async (req, res) => {
  res.json(await prisma.projectAccessRequest.findMany({ where: { projectId: req.auth!.projectId!, status: 'PENDING', user: { globalRole: 'USER' } }, select: { id: true, createdAt: true, user: { select: { email: true, displayName: true } } }, orderBy: { createdAt: 'asc' } }))
}))

app.patch('/api/projects/:projectId/access-requests/:requestId', requirePermission('member:manage'), route(async (req, res) => {
  const { status } = z.object({ status: z.enum(['APPROVED', 'REJECTED']) }).parse(req.body)
  const projectId = req.auth!.projectId!
  await prisma.$transaction(async tx => {
    const request = await tx.projectAccessRequest.findFirst({ where: { id: String(req.params.requestId), projectId, user: { globalRole: 'USER' } } })
    if (!request) throw new HttpError(404, 'Solicitud no encontrada')
    const result = await tx.projectAccessRequest.updateMany({ where: { id: request.id, status: 'PENDING' }, data: { status, reviewedAt: new Date() } })
    if (!result.count) throw new HttpError(409, 'La solicitud ya fue revisada')
    if (status === 'APPROVED') await tx.projectMembership.upsert({ where: { projectId_userId: { projectId, userId: request.userId } }, create: { projectId, userId: request.userId, role: 'VIEWER' }, update: {} })
  })
  res.status(204).end()
}))

app.get('/api/projects/:projectId/members', requirePermission('member:read'), route(async (req, res) => {
  res.json(await prisma.projectMembership.findMany({ where: { projectId: req.auth!.projectId!, ...(req.auth!.globalRole !== 'SUPERADMIN' ? { user: { globalRole: 'USER' as const } } : {}) }, select: { role: true, createdAt: true, user: { select: { id: true, email: true, displayName: true } } } }))
}))

app.post('/api/projects/:projectId/members', requirePermission('member:manage'), route(async (req, res) => {
  const input = z.object({ email: z.string().email(), role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']) }).parse(req.body)
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })
  if (!user || (user.globalRole === 'SUPERADMIN' && req.auth!.globalRole !== 'SUPERADMIN')) throw new HttpError(404, 'Usuario no encontrado')
  const current = await prisma.projectMembership.findUnique({ where: { projectId_userId: { projectId: req.auth!.projectId!, userId: user.id } } })
  if (current?.role === 'ADMIN' && input.role !== 'ADMIN') {
    const admins = await prisma.projectMembership.count({ where: { projectId: req.auth!.projectId!, role: 'ADMIN' } })
    if (admins <= 1) throw new HttpError(409, 'El proyecto debe conservar al menos un ADMIN')
  }
  res.status(201).json(await prisma.projectMembership.upsert({ where: { projectId_userId: { projectId: req.auth!.projectId!, userId: user.id } }, create: { projectId: req.auth!.projectId!, userId: user.id, role: input.role }, update: { role: input.role } }))
}))

async function protectLastAdmin(projectId: string, userId: string, nextRole?: ProjectRole) {
  const membership = await prisma.projectMembership.findUnique({ where: { projectId_userId: { projectId, userId } } })
  if (!membership) throw new HttpError(404, 'Miembro no encontrado')
  if (membership.role === 'ADMIN' && nextRole !== 'ADMIN') {
    const admins = await prisma.projectMembership.count({ where: { projectId, role: 'ADMIN' } })
    if (admins <= 1) throw new HttpError(409, 'El proyecto debe conservar al menos un ADMIN')
  }
  return membership
}

async function protectSuperadminMember(auth: Auth, userId: string) {
  if (auth.globalRole === 'SUPERADMIN') return
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { globalRole: true } })
  if (!target || target.globalRole === 'SUPERADMIN') throw new HttpError(404, 'Miembro no encontrado')
}

app.patch('/api/projects/:projectId/members/:userId', requirePermission('member:manage'), route(async (req, res) => {
  const input = z.object({ role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']) }).parse(req.body)
  const projectId = req.auth!.projectId!; const userId = String(req.params.userId)
  await protectSuperadminMember(req.auth!, userId)
  await protectLastAdmin(projectId, userId, input.role)
  res.json(await prisma.projectMembership.update({ where: { projectId_userId: { projectId, userId } }, data: { role: input.role } }))
}))

app.delete('/api/projects/:projectId/members/:userId', requirePermission('member:manage'), route(async (req, res) => {
  const projectId = req.auth!.projectId!; const userId = String(req.params.userId)
  await protectSuperadminMember(req.auth!, userId)
  await protectLastAdmin(projectId, userId)
  await prisma.projectMembership.delete({ where: { projectId_userId: { projectId, userId } } })
  res.status(204).end()
}))

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) return res.status(400).json({ error: 'Solicitud inválida', details: error.issues })
  if (error instanceof HttpError) return res.status(error.status).json({ error: error.message })
  console.error(error)
  res.status(500).json({ error: 'Error interno' })
})

app.listen(env.PORT, () => console.log(`API wiki escuchando en http://localhost:${env.PORT}`))
