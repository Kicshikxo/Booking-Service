import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as userRepository from '../repositories/user.repository'

const JWT_SECRET = process.env.AUTH_SECRET_KEY || '<secret_key>'
export const AUTH_TOKEN_COOKIE_NAME = 'booking-auth-token'

export async function handleSignUp(email: string, password: string) {
  const user = await userRepository.createUser(email, await bcrypt.hash(password, 8))
  if (!user) return null

  const token = signToken(user.user_id)
  return { token }
}

export async function handleSingIn(email: string, password: string) {
  const user = await userRepository.findUserByEmail(email)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return null

  const token = signToken(user.user_id)
  return { token }
}

export function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}
