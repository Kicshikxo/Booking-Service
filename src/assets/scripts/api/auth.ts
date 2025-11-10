import axios from 'axios'

export async function checkAuth() {
  try {
    const response = await axios.get('/api/auth/check')

    return response.status === 200
  } catch (error: any) {
    return error.status !== 401
  }
}

export async function signUp(email: string, password: string) {
  const response = await axios.post('/api/auth/sign-up', { email, password })

  return !!response.data.token
}

export async function signIn(email: string, password: string) {
  const response = await axios.post('/api/auth/sign-in', { email, password })

  return !!response.data.token
}

export async function signOut() {
  const response = await axios.post('/api/auth/sign-out')

  return response.status === 200
}
