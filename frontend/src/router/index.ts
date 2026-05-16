import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
    { path: '/console', name: 'console', component: () => import('@/views/ConsoleView.vue'), meta: { requiresAuth: true } },
    { path: '/console/text2image', name: 'text2image', component: () => import('@/views/Text2ImageView.vue'), meta: { requiresAuth: true } },
    { path: '/console/image2image', name: 'image2image', component: () => import('@/views/Image2ImageView.vue'), meta: { requiresAuth: true } },
    { path: '/console/history', name: 'history', component: () => import('@/views/HistoryView.vue'), meta: { requiresAuth: true } },
    { path: '/console/settings', name: 'settings', component: () => import('@/views/SettingsView.vue'), meta: { requiresAuth: true } },
    { path: '/pricing', name: 'pricing', component: () => import('@/views/PricingView.vue') },
    { path: '/docs', name: 'docs', component: () => import('@/views/DocsView.vue') }
  ]
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router