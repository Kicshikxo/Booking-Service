import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import { ru } from 'primelocale/js/ru.js'
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
    locale: ru,
    ripple: true,
    theme: {
      preset: definePreset(Aura, {
        semantic: {
          primary: {
            50: '{slate.50}',
            100: '{slate.100}',
            200: '{slate.200}',
            300: '{slate.300}',
            400: '{slate.400}',
            500: '{slate.500}',
            600: '{slate.600}',
            700: '{slate.700}',
            800: '{slate.800}',
            900: '{slate.900}',
            950: '{slate.950}',
          },
        },
      }),
    },
  })

  return { app, router }
}
