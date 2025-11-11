import axios from 'axios'
import { clearSession, setSession } from '../../../composables/useSession'

export async function checkAuth() {
  try {
    const response = await axios.get('/api/auth/check')

    setSession(response.data.user)

    return response.status === 200
  } catch (error: any) {
    if (error.response.status === 401) {
      clearSession()
      return false
    }

    return true
  }
}

export async function signUp(email: string, password: string) {
  await axios.post('/api/auth/sign-up', { email, password })

  return await checkAuth()
}

export async function signIn(email: string, password: string) {
  await axios.post('/api/auth/sign-in', { email, password })

  return await checkAuth()
}

export async function signOut() {
  await axios.post('/api/auth/sign-out')

  return !(await checkAuth())
}
