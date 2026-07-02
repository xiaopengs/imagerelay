import axios from 'axios'

// 管理接口 — baseURL 为 /api
const api = axios.create({ baseURL: '/api' })

function authHeaders() {
  const token = localStorage.getItem('token') || ''
  return { Authorization: `Bearer ${token}` }
}

export const userApi = {
  // 兑换码充值
  topUp: (key: string) =>
    api.post('/user/topup', { key }, { headers: authHeaders() }),

  // API Token 管理
  createToken: () =>
    api.post('/token/', {}, { headers: authHeaders() }),

  getTokens: () =>
    api.get('/token/', { headers: authHeaders() }),

  deleteToken: (id: number) =>
    api.delete(`/token/${id}`, { headers: authHeaders() }),

  // 使用日志（可按 type 过滤，type=5 为图片生成）
  getLogs: (page = 1, type?: number) => {
    const params = new URLSearchParams({ page: String(page), p_size: '20' })
    if (type !== undefined) params.set('type', String(type))
    return api.get(`/log/self?${params}`, { headers: authHeaders() })
  },
}
