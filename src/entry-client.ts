import { createApp } from './main'

import 'primeicons/primeicons.css'
import './assets/styles/rubik.fontface.css'
import './assets/styles/tailwind.css'

const { app, router } = createApp()

router.isReady().then(() => {
  app.mount('#app')
})
