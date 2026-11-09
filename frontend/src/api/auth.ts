import axios from 'axios'

// 管理接口 — baseURL 为 /api（new-api 管理路由在 /api/user/* 下）
const api = axios.create({ baseURL: '/api' })

function authHeaders() {
  // new-api 的用户态接口需要 `New-Api-User` 头（值为用户 id）+ 登录 Cookie
  const userId = localStorage.getItem('userId') || ''
  return { 'New-Api-User': userId }
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/user/login', { email, password }),

  register: (email: string, password: string) =>
    api.post('/user/register', { email, password }),

  getSelf: () =>
    api.get('/user/self', { headers: authHeaders() }),
}
