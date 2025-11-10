import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import { createSSRApp } from 'vue'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import Auth from './pages/auth.vue'
import Index from './pages/index.vue'

import authMiddleware from './middleware/auth'

export function createApp() {
  const app = createSSRApp(App)

  const routes = [
    { path: '/auth', component: Auth },
    { path: '/', component: Index },
  ]

  const router = import.meta.env.SSR
    ? createRouter({ history: createMemoryHistory(), routes })
    : createRouter({ history: createWebHistory(), routes })

  router.beforeEach(authMiddleware)

  app.use(router)
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
    },
  })

  return { app, router }
}
