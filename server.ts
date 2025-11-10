import compression from 'compression'
import cookieParser from 'cookie-parser'
import express, { Response } from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import sirv from 'sirv'
import { createServer, ViteDevServer } from 'vite'

import appRouter from './server/controllers/app.controller'
import { initDatabase } from './server/database'
import { authMiddleware, AuthRequest } from './server/middleware/auth.middleware'

const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 3000
const base = process.env.BASE || '/'

const app = express()
let vite: ViteDevServer | undefined

app.use(express.json())
app.use(cookieParser())
app.use(compression())

if (isProduction) {
  app.use(base, sirv('dist/client', { extensions: [] }))
} else {
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
}

async function handleRequest(request: AuthRequest, response: Response) {
  try {
    const url = request.user ? request.originalUrl.replace(base, '') : 'auth'

    const template = isProduction
      ? await fs.readFile('dist/client/index.html', 'utf-8')
      : await vite!.transformIndexHtml(url, await fs.readFile('index.html', 'utf-8'))
    const { render } = isProduction
      ? await import(path.resolve('dist/server/entry-server.js'))
      : await vite!.ssrLoadModule('src/entry-server.ts')

    const { head, body } = await render(url)

    const html = template
      .replace(`<!--app-head-->`, head ?? '')
      .replace(`<!--app-body-->`, body ?? '')

    response.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  } catch (error: any) {
    vite?.ssrFixStacktrace(error)
    console.log(error.stack)
    response.status(500).end(error.stack)
  }
}

app.use(appRouter)
app.use('*all', authMiddleware({ soft: true }), handleRequest)

initDatabase()
  .catch((error) => {
    console.error('Failed to initialize database:', error)
    process.exit(1)
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`)
    })
  })
