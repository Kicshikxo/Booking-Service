import compression from 'compression'
import cookieParser from 'cookie-parser'
import express, { Request, Response } from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import sirv from 'sirv'
import { createServer, ViteDevServer } from 'vite'

import authRouter from './server/controllers/auth.controller'
import bookingsRouter from './server/controllers/bookings.controller'
import eventsRouter from './server/controllers/events.controller'
import { initDatabase } from './server/database'

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

async function handleRequest(request: Request, response: Response) {
  try {
    const url = request.originalUrl.replace(base, '')

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

app.use('/api/auth', authRouter)
app.use('/api/events', eventsRouter)
app.use('/api/bookings', bookingsRouter)

app.use('*all', handleRequest)

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
