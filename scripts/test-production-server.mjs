import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const probe = createServer()
await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve))
const port = probe.address().port
await new Promise(resolve => probe.close(resolve))
const child = spawn(process.execPath, [fileURLToPath(new URL('../server/dist/index.js', import.meta.url))], {
  env: { ...process.env, NODE_ENV: 'production', PORT: String(port), DATABASE_URL: 'postgresql://test:test@127.0.0.1:1/test' },
  stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
})
const base = `http://127.0.0.1:${port}`
try {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('El servidor no inició a tiempo')), 15000)
    child.once('error', error => { clearTimeout(timeout); reject(error) })
    child.once('exit', code => { clearTimeout(timeout); reject(new Error(`El servidor terminó: ${code}`)) })
    child.stdout.on('data', data => { if (String(data).includes('API wiki escuchando')) { clearTimeout(timeout); resolve() } })
  })
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
  for (const route of ['/', '/login', '/help/installation', '/projects/example/docs/document']) {
    const response = await fetch(base + route)
    assert.equal(response.status, 200, route)
    assert.match(response.headers.get('content-type'), /text\/html/)
    assert.equal(await response.text(), html)
    assert.equal(response.headers.get('cache-control'), 'no-cache')
  }
  const asset = html.match(/src="(\/assets\/[^\"]+\.js)"/)[1]
  const response = await fetch(base + asset)
  assert.equal(response.status, 200)
  assert.match(response.headers.get('cache-control'), /immutable/)
  assert.deepEqual(await (await fetch(`${base}/api/health`)).json(), { ok: true })
  const missing = await fetch(`${base}/api/not-a-route`)
  assert.equal(missing.status, 404)
  assert.match(missing.headers.get('content-type'), /application\/json/)
  assert.equal((await fetch(`${base}/api/auth/session`)).status, 401)
  assert.equal((await fetch(`${base}/assets/missing.js`)).status, 404)
  assert.equal((await fetch(`${base}/login`, { method: 'POST' })).status, 404)
  console.log('OK: servidor de producción, rutas React, assets, caché, API y errores 404.')
} finally {
  child.kill()
}
