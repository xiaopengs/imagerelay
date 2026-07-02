import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/global.css'
import { setupAxiosInterceptors } from './utils/axiosSetup'

setupAxiosInterceptors()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')