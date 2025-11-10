import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import { createSSRApp } from 'vue'

import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
    },
  })
  return { app }
}
