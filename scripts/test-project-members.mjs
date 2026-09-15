import assert from 'node:assert/strict'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const base = process.env.API_URL || 'http://localhost:3000/api'
const fixtures = []
const call = (path, cookie, method = 'GET', body) => fetch(`${base}${path}`, {
  method, headers: { ...(cookie ? { cookie } : {}), 'content-type': 'application/json' },
  ...(body ? { body: JSON.stringify(body) } : {}),
})
async function register(label) {
  const email = `members-${label}-${crypto.randomUUID()}@example.com`
  const project = await prisma.project.create({ data: { name: label, slug: `members-${crypto.randomUUID()}` } })
  const response = await call('/auth/register', null, 'POST', { email, displayName: label, password: 'MembersTest123!' })
  assert.equal(response.status, 201)
  const cookie = response.headers.get('set-cookie').split(';')[0]
  const session = await (await call('/auth/session', cookie)).json()
  const fixture = { email, cookie, userId: session.user.id, projectId: project.id }
  fixtures.push(fixture)
  await prisma.projectMembership.create({ data: { projectId: project.id, userId: session.user.id, role: 'ADMIN' } })
  return fixture
}
let superCookie
try {
  const login = await call('/auth/login', null, 'POST', { email: process.env.SEED_SUPERADMIN_EMAIL || 'admin@example.com', password: process.env.SEED_SUPERADMIN_PASSWORD || 'Admin123!' })
  assert.equal(login.status, 204)
  superCookie = login.headers.get('set-cookie').split(';')[0]
  const owner = await register('Owner')
  const guest = await register('Guest')
  const path = `/projects/${owner.projectId}/members`
  const superUser = (await (await call('/auth/session', superCookie)).json()).user
  assert.equal((await call(path, superCookie, 'POST', { email: superUser.email, role: 'ADMIN' })).status, 201)
  assert.ok((await (await call(path, superCookie)).json()).some(member => member.user.id === superUser.id))
  assert.ok(!(await (await call(path, owner.cookie)).json()).some(member => member.user.id === superUser.id))
  assert.equal((await call(path, owner.cookie, 'POST', { email: superUser.email, role: 'VIEWER' })).status, 404)
  assert.equal((await call(`${path}/${superUser.id}`, owner.cookie, 'PATCH', { role: 'VIEWER' })).status, 404)
  assert.equal((await call(`${path}/${superUser.id}`, owner.cookie, 'DELETE')).status, 404)
  assert.equal((await prisma.projectMembership.findUnique({ where: { projectId_userId: { projectId: owner.projectId, userId: superUser.id } } })).role, 'ADMIN')
  assert.equal((await call(`${path}/${superUser.id}`, superCookie, 'PATCH', { role: 'EDITOR' })).status, 200)
  assert.equal((await call(`${path}/${superUser.id}`, superCookie, 'DELETE')).status, 204)
  assert.equal((await call(path, owner.cookie, 'POST', { email: superUser.email, role: 'ADMIN' })).status, 404)
  assert.equal((await call('/membership-projects')).status, 401)
  assert.deepEqual((await (await call('/membership-projects', owner.cookie)).json()).map(p => p.id), [owner.projectId])
  assert.equal((await call(`/projects/${guest.projectId}/members`, owner.cookie)).status, 404)
  assert.equal((await call(path, superCookie)).status, 200)
  assert.equal((await call(path, owner.cookie, 'POST', { email: guest.email, role: 'VIEWER' })).status, 201)
  for (const role of ['VIEWER', 'EDITOR']) {
    assert.equal((await call(`${path}/${guest.userId}`, owner.cookie, 'PATCH', { role })).status, 200)
    assert.ok(!(await (await call('/membership-projects', guest.cookie)).json()).some(p => p.id === owner.projectId))
    assert.equal((await call(path, guest.cookie, 'POST', { email: owner.email, role: 'VIEWER' })).status, 403)
    assert.equal((await call(`${path}/${owner.userId}`, guest.cookie, 'PATCH', { role: 'VIEWER' })).status, 403)
    assert.equal((await call(`${path}/${owner.userId}`, guest.cookie, 'DELETE')).status, 403)
  }
  assert.equal((await call(`${path}/${guest.userId}`, owner.cookie, 'PATCH', { role: 'ADMIN' })).status, 200)
  assert.ok((await (await call('/membership-projects', guest.cookie)).json()).some(p => p.id === owner.projectId))
  assert.equal((await call(`${path}/${guest.userId}`, owner.cookie, 'DELETE')).status, 204)
  assert.equal((await call(`${path}/${owner.userId}`, owner.cookie, 'DELETE')).status, 409)
  for (const state of [{ blocked: true }, { blocked: false, archived: true }]) {
    assert.equal((await call(`/admin/projects/${owner.projectId}`, superCookie, 'PATCH', state)).status, 200)
    assert.equal((await call(path, owner.cookie)).status, 423)
    assert.equal((await call(path, superCookie)).status, 200)
    assert.equal((await call(path, superCookie, 'POST', { email: guest.email, role: 'VIEWER' })).status, 201)
    assert.equal((await call(`${path}/${guest.userId}`, superCookie, 'DELETE')).status, 204)
    assert.ok((await (await call('/membership-projects', superCookie)).json()).some(p => p.id === owner.projectId))
    assert.ok(!(await (await call('/membership-projects', owner.cookie)).json()).some(p => p.id === owner.projectId))
    assert.equal((await call(`/projects/${owner.projectId}/documents`, superCookie)).status, 423)
  }
  console.log('OK: asignaciones, roles ADMIN/EDITOR/VIEWER, aislamiento, SUPERADMIN, proyectos bloqueados/archivados y ultimo ADMIN.')
} finally {
  for (const fixture of fixtures) await prisma.project.deleteMany({ where: { id: fixture.projectId } })
  for (const fixture of fixtures) await prisma.user.deleteMany({ where: { id: fixture.userId } })
  if (superCookie) await call('/auth/logout', superCookie, 'POST')
  await prisma.$disconnect()
}
