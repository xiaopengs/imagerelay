import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 公开页
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
    { path: '/pricing', name: 'pricing', component: () => import('@/views/PricingView.vue') },
    { path: '/gallery', name: 'gallery', component: () => import('@/views/GalleryView.vue') },

    // 需登录
    { path: '/console', name: 'console', component: () => import('@/views/ConsoleView.vue'), meta: { requiresAuth: true } },
    { path: '/console/create', name: 'create', component: () => import('@/views/CreateView.vue'), meta: { requiresAuth: true } },
    { path: '/console/billing', name: 'billing', component: () => import('@/views/BillingView.vue'), meta: { requiresAuth: true } },
    { path: '/console/settings', name: 'settings', component: () => import('@/views/SettingsView.vue'), meta: { requiresAuth: true } },
  ]
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
