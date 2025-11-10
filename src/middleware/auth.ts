import {
  NavigationGuardNext,
  RouteLocationNormalizedGeneric,
  RouteLocationNormalizedLoadedGeneric,
} from 'vue-router'
import { checkAuth } from '../assets/scripts/api/auth'

export default async (
  to: RouteLocationNormalizedGeneric,
  _from: RouteLocationNormalizedLoadedGeneric,
  next: NavigationGuardNext,
) => {
  if (import.meta.env.SSR) {
    return next()
  }

  const authenticated = await checkAuth()
  if (!authenticated && to.path !== '/auth') {
    return next('/auth')
  }
  if (authenticated && to.path === '/auth') {
    return next('/')
  }

  next()
}
