import express, { type Express } from 'express'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function serveFrontend(app: Express) {
  const directory = fileURLToPath(new URL('../../dist/', import.meta.url))
  const index = path.join(directory, 'index.html')
  if (!existsSync(index)) throw new Error('Frontend sin compilar. Ejecuta npm run build antes de iniciar en producción.')

  app.use('/assets', express.static(path.join(directory, 'assets'), { immutable: true, maxAge: '1y', index: false }))
  app.use(express.static(directory, { index: false, maxAge: 0 }))
  app.use((req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method) || !req.accepts('html') || req.path.startsWith('/assets/') || path.extname(req.path)) return next()
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(index)
  })
}
