// Normalize origin to localhost so OIDC state storage is consistent.
// 127.0.0.1 and localhost are different origins from the browser's perspective.
if (window.location.hostname === '127.0.0.1') {
  const normalized = window.location.href.replace('127.0.0.1', 'localhost')
  window.location.replace(normalized)
}

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

createApp(App).use(router).mount('#app')
