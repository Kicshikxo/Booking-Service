import { Request, Response, Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { findUserByEmail } from '../repositories/user.repository'
import { AUTH_TOKEN_COOKIE_NAME, handleSignUp, handleSingIn } from '../services/auth.service'

const router = Router()

router.post('/sign-up', async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body ?? {}
    if (!email || !password) return response.status(400).json({ error: 'INVALID CREDENTIALS' })

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return response.status(400).json({ error: 'EMAIL ALREADY EXISTS' })
    }

    const data = await handleSignUp(email, password)
    if (!data) {
      return response.status(401).json({ error: 'INVALID CREDENTIALS' })
    }

    response.cookie(AUTH_TOKEN_COOKIE_NAME, data.token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    response.status(201).json(data)
  } catch (error: any) {
    console.error(error)
    response.status(500).json({ error: error.message })
  }
})

router.post('/sign-in', async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body ?? {}
    if (!email || !password) return response.status(400).json({ error: 'INVALID CREDENTIALS' })

    const data = await handleSingIn(email, password)
    if (!data) {
      return response.status(401).json({ error: 'INVALID CREDENTIALS' })
    }

    response.cookie(AUTH_TOKEN_COOKIE_NAME, data.token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    response.status(200).json(data)
  } catch (error: any) {
    console.error(error)
    response.status(500).json({ error: error.message })
  }
})

router.post('/sign-out', (request: Request, response: Response) => {
  response.clearCookie(AUTH_TOKEN_COOKIE_NAME)

  response.status(200).json({ message: 'OK' })
})

router.get('/check', authMiddleware(), (request: AuthRequest, response: Response) => {
  response.json({ user: request.user })
})

export default router
