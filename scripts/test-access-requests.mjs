import assert from 'node:assert/strict'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const base = process.env.API_URL || 'http://localhost:3000/api'
const userIds = [], projectIds = []
const call = (path, cookie, method = 'GET', body) => fetch(`${base}${path}`, { method, headers: { ...(cookie ? { cookie } : {}), 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) })
async function login(email) {
  const result = await call('/auth/login', null, 'POST', { email, password: 'TestAccess123!' })
  assert.equal(result.status, 204)
  return result.headers.get('set-cookie').split(';')[0]
}
try {
  const owner = await prisma.user.create({ data: { email: `owner-${crypto.randomUUID()}@example.com`, passwordHash: await bcrypt.hash('TestAccess123!', 4) } })
  userIds.push(owner.id)
  const project = await prisma.project.create({ data: { name: 'Access test', slug: `access-${crypto.randomUUID()}`, memberships: { create: { userId: owner.id, role: 'ADMIN' } } } })
  projectIds.push(project.id)
  const ownerCookie = await login(owner.email)
  assert.equal((await call('/auth/preferences', null, 'PATCH', { defaultProjectId: null })).status, 401)
  assert.equal((await call('/auth/projects')).status, 401)
  assert.equal((await call('/access-requests/pending')).status, 401)
  assert.equal((await call('/access-requests', null, 'POST', { projectIds: [project.id] })).status, 401)
  const catalog = await (await call('/auth/projects', ownerCookie)).json()
  assert.ok(catalog.some(p => p.id === project.id))
  assert.ok(catalog.every(p => Object.keys(p).sort().join(',') === 'id,name'))
  for (const status of ['APPROVED', 'REJECTED']) {
    const email = `applicant-${crypto.randomUUID()}@example.com`
    const payload = { email, displayName: 'Applicant', password: 'TestAccess123!' }
    const registered = await call('/auth/register', null, 'POST', payload)
    assert.equal(registered.status, 201)
    userIds.push((await registered.json()).id)
    const cookie = registered.headers.get('set-cookie').split(';')[0]
    const initial = await (await call('/auth/session', cookie)).json()
    assert.equal(initial.projects.length, 0)
    assert.equal((await call('/auth/preferences', cookie, 'PATCH', { defaultProjectId: project.id })).status, 404)
    assert.equal(initial.accessRequests.length, 0)
    const second = await prisma.project.create({ data: { name: 'Second access test', slug: `second-${crypto.randomUUID()}` } })
    projectIds.push(second.id)
    assert.equal((await call('/access-requests', cookie, 'POST', { projectIds: [] })).status, 400)
    assert.equal((await call('/access-requests', cookie, 'POST', { projectIds: [project.id, second.id] })).status, 204)
    assert.equal((await call('/access-requests', cookie, 'POST', { projectIds: [project.id, second.id] })).status, 204)
    const session = await (await call('/auth/session', cookie)).json()
    assert.equal(session.accessRequests.length, 2)
    assert.deepEqual(await (await call('/access-requests/pending', cookie)).json(), [])
    const pending = await (await call('/access-requests/pending', ownerCookie)).json()
    assert.ok(pending.some(request => request.project.id === project.id))
    assert.ok(pending.every(request => request.project.id === project.id))
    await prisma.user.update({ where: { id: owner.id }, data: { globalRole: 'SUPERADMIN' } })
    const allPending = await (await call('/access-requests/pending', ownerCookie)).json()
    assert.ok(allPending.some(request => request.project.id === second.id))
    await prisma.user.update({ where: { id: owner.id }, data: { globalRole: 'USER' } })
    assert.equal(session.projects.length, 0)
    assert.equal(session.accessRequests[0].status, 'PENDING')
    const path = `/projects/${project.id}/access-requests`
    const requestId = session.accessRequests.find(r => r.project.id === project.id).id
    assert.equal((await call(`/projects/${second.id}/access-requests`, ownerCookie)).status, 404)
    assert.equal((await call(`/projects/${project.id}/documents`, cookie)).status, 404)
    assert.equal((await call(path, cookie)).status, 404)
    assert.equal((await call(`${path}/${requestId}`, cookie, 'PATCH', { status })).status, 404)
    assert.ok((await (await call(path, ownerCookie)).json()).some(r => r.id === requestId))
    assert.equal((await call(`${path}/${requestId}`, ownerCookie, 'PATCH', { status })).status, 204)
    assert.equal((await call(`${path}/${requestId}`, ownerCookie, 'PATCH', { status: status === 'APPROVED' ? 'REJECTED' : 'APPROVED' })).status, 409)
    const updated = await (await call('/auth/session', await login(email))).json()
    assert.equal(updated.accessRequests.find(r => r.project.id === project.id).status, status)
    assert.equal(updated.accessRequests.find(r => r.project.id === second.id).status, 'PENDING')
    assert.equal(updated.projects.length, status === 'APPROVED' ? 1 : 0)
    assert.ok(!(await (await call('/access-requests/pending', ownerCookie)).json()).some(request => request.id === requestId))
    assert.equal((await call(`/access-requests/${requestId}`, ownerCookie, 'DELETE')).status, 409)
    assert.equal((await call(`/access-requests/${requestId}/retry`, ownerCookie, 'POST')).status, 409)
    if (status === 'REJECTED') {
      assert.equal((await call(`/access-requests/${requestId}/retry`, cookie, 'POST')).status, 204)
      assert.equal((await call(`/access-requests/${requestId}/retry`, cookie, 'POST')).status, 409)
      assert.ok((await (await call('/access-requests/pending', ownerCookie)).json()).some(r => r.id === requestId))
      assert.equal((await call(`/access-requests/${requestId}`, cookie, 'DELETE')).status, 204)
      assert.ok(!(await (await call('/access-requests/pending', ownerCookie)).json()).some(r => r.id === requestId))
      assert.ok(!(await (await call('/auth/session', cookie)).json()).accessRequests.some(r => r.id === requestId))
      assert.equal((await call('/access-requests', cookie, 'POST', { projectIds: [project.id] })).status, 204)
    }
    if (status === 'APPROVED') {
      assert.equal((await call(`/access-requests/${requestId}`, cookie, 'DELETE')).status, 409)
      assert.equal((await call(`/access-requests/${requestId}/retry`, cookie, 'POST')).status, 409)
      assert.equal(updated.projects[0].role, 'VIEWER')
      assert.equal((await call('/auth/preferences', cookie, 'PATCH', { defaultProjectId: project.id })).status, 204)
      assert.equal((await (await call('/auth/session', await login(email))).json()).user.defaultProjectId, project.id)
      await prisma.projectMembership.create({ data: { projectId: second.id, userId: updated.user.id, role: 'VIEWER' } })
      assert.equal((await call('/auth/preferences', cookie, 'PATCH', { defaultProjectId: second.id })).status, 204)
      assert.equal((await (await call('/auth/session', cookie)).json()).user.defaultProjectId, second.id)
      await prisma.project.update({ where: { id: second.id }, data: { blockedAt: new Date() } })
      const blockedSession = await (await call('/auth/session', cookie)).json()
      assert.ok(!blockedSession.projects.some(item => item.id === blockedSession.user.defaultProjectId))
      assert.equal((await call('/auth/preferences', cookie, 'PATCH', { defaultProjectId: second.id })).status, 404)
      assert.equal((await call('/auth/preferences', cookie, 'PATCH', { defaultProjectId: null })).status, 204)
      assert.equal((await (await call('/auth/session', cookie)).json()).user.defaultProjectId, null)
      assert.equal((await call('/auth/preferences', cookie, 'PATCH', { defaultProjectId: project.id })).status, 204)

      assert.equal((await call(path, cookie)).status, 403)
      assert.equal((await call(`/projects/${project.id}/documents`, cookie)).status, 200)
    }
  }
  console.log('OK: registro, registro sin proyecto y solicitudes multiples, pendiente sin acceso, aprobacion VIEWER, rechazo, login y doble revision.')
} finally {
  await prisma.project.deleteMany({ where: { id: { in: projectIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
  await prisma.$disconnect()
}
