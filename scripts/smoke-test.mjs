import assert from 'node:assert/strict'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const base = process.env.API_URL || 'http://localhost:3000/api'
async function login(email) {
  const response = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: 'Admin123!' }) })
  assert.equal(response.status, 204)
  return response.headers.get('set-cookie').split(';')[0]
}
const call = (path, cookie, options = {}) => fetch(`${base}${path}`, { ...options, headers: { cookie, 'content-type': 'application/json', ...options.headers } })
const viewerCookie = await login('viewer@example.com')
const adminCookie = await login('admin@example.com')
const viewerSession = await (await call('/auth/session', viewerCookie)).json()
const adminSession = await (await call('/auth/session', adminCookie)).json()
const allowedId = viewerSession.projects[0].id
const privateId = adminSession.projects.find(project => project.slug === 'tenant-privado').id
assert.equal((await call(`/projects/${allowedId}/documents`, viewerCookie)).status, 200)
assert.equal((await call(`/projects/${privateId}/documents`, viewerCookie)).status, 404)
assert.equal((await call(`/projects/${allowedId}/documents`, viewerCookie, { method: 'POST', body: JSON.stringify({ slug: 'forbidden', title: 'Forbidden', section: 'QA', markdown: 'No' }) })).status, 403)
const members = await (await call(`/projects/${privateId}/members`, adminCookie)).json()
const lastAdmin = members.find(member => member.role === 'ADMIN')
assert.equal((await call(`/projects/${privateId}/members/${lastAdmin.user.id}`, adminCookie, { method: 'PATCH', body: JSON.stringify({ role: 'VIEWER' }) })).status, 409)
assert.equal((await call('/auth/logout', viewerCookie, { method: 'POST' })).status, 204)
assert.equal((await call('/auth/session', viewerCookie)).status, 401)
const registerEmail = `smoke-${Date.now()}@example.com`
const registerResponse = await fetch(`${base}/auth/register`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: registerEmail, displayName: 'Smoke User', password: 'SmokePass123!' }) })
assert.equal(registerResponse.status, 201)
const registerCookie = registerResponse.headers.get('set-cookie').split(';')[0]
const registeredSession = await (await call('/auth/session', registerCookie)).json()
assert.equal(registeredSession.projects.length, 1)
assert.equal(registeredSession.projects[0].role, 'ADMIN')
const registeredUserId = registeredSession.user.id
const registeredProjectId = registeredSession.projects[0].id
assert.equal((await call('/admin/users', adminCookie)).status, 200)
assert.equal((await call('/admin/projects', adminCookie)).status, 200)
assert.equal((await call(`/admin/projects/${registeredProjectId}`, adminCookie, { method: 'PATCH', body: JSON.stringify({ isReadOnly: true }) })).status, 200)
assert.equal((await call(`/projects/${registeredProjectId}/documents`, registerCookie, { method: 'POST', body: JSON.stringify({ slug: 'readonly', title: 'Readonly', section: 'QA', markdown: 'No' }) })).status, 423)
await call(`/admin/projects/${registeredProjectId}`, adminCookie, { method: 'PATCH', body: JSON.stringify({ isReadOnly: false, blocked: true }) })
assert.equal((await call(`/projects/${registeredProjectId}/documents`, registerCookie)).status, 423)
await call(`/admin/projects/${registeredProjectId}`, adminCookie, { method: 'PATCH', body: JSON.stringify({ blocked: false, archived: true }) })
assert.equal((await call(`/projects/${registeredProjectId}/documents`, registerCookie)).status, 423)
await call(`/admin/projects/${registeredProjectId}`, adminCookie, { method: 'PATCH', body: JSON.stringify({ archived: false }) })
const resetResponse = await call(`/admin/users/${registeredUserId}/reset-password`, adminCookie, { method: 'POST' })
assert.equal(resetResponse.status, 200)
const { temporaryPassword } = await resetResponse.json()
assert.match(temporaryPassword, /^Tmp-/)
assert.equal((await call('/auth/session', registerCookie)).status, 401)
assert.equal((await call(`/admin/users/${registeredUserId}`, adminCookie, { method: 'PATCH', body: JSON.stringify({ blocked: true }) })).status, 200)
assert.equal((await call(`/admin/users/${registeredUserId}`, adminCookie, { method: 'PATCH', body: JSON.stringify({ blocked: false }) })).status, 200)
await prisma.project.delete({ where: { id: registeredProjectId } })
await prisma.user.delete({ where: { email: registerEmail } })
await prisma.$disconnect()
console.log('Smoke RBAC OK: registro, cambio de proyecto, usuarios, estados de proyecto, aislamiento y logout.')
