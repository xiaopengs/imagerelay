import axios from 'axios'

// 管理接口 — baseURL 为 /api（new-api 管理路由在 /api/user/* 下）
const api = axios.create({ baseURL: '/api' })

function authHeaders() {
  const token = localStorage.getItem('token') || ''
  return { Authorization: `Bearer ${token}` }
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/user/login', { email, password }),

  register: (email: string, password: string) =>
    api.post('/user/register', { email, password }),

  getSelf: () =>
    api.get('/user/self', { headers: authHeaders() }),
}
