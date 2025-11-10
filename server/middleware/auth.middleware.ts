import { NextFunction, Request, Response } from 'express'
import { AUTH_TOKEN_COOKIE_NAME, verifyToken } from '../services/auth.service'

export interface AuthRequest extends Request {
  user?: { userId: string }
}

export function authMiddleware(request: AuthRequest, response: Response, next: NextFunction) {
  const token = request.cookies?.[AUTH_TOKEN_COOKIE_NAME]
  if (!token) {
    return response.status(401).json({ error: 'UNABLE TO READ TOKEN' })
  }

  const user = verifyToken(token)
  if (!user) {
    return response.status(401).json({ error: 'INVALID TOKEN' })
  }

  request.user = user
  next()
}
