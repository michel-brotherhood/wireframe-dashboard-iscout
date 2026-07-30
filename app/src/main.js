import { createApp } from 'vue'
import './index.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#root')

// PWA: registra o service worker só em produção (evita cache atrapalhando o dev).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* falha silenciosa — app funciona sem SW */
    })
  })
}
