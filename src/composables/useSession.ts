import { reactive } from 'vue'

export type SessionUser = {
  userId: string
}

export const sessionState = reactive<{
  user: SessionUser | null
}>({
  user: null,
})

export function setSession(user: SessionUser | null) {
  sessionState.user = user
}

export function clearSession() {
  sessionState.user = null
}
