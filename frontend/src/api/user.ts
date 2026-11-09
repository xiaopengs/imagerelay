import axios from 'axios'

// 管理接口 — baseURL 为 /api
const api = axios.create({ baseURL: '/api' })

function authHeaders() {
  const userId = localStorage.getItem('userId') || ''
  return { 'New-Api-User': userId }
}

export const userApi = {
  // 个人信息
  updateSelf: (payload: { display_name: string }) =>
    api.put('/user/self', payload, { headers: authHeaders() }),

  // 兑换码充值
  topUp: (key: string) =>
    api.post('/user/topup', { key }, { headers: authHeaders() }),

  // API Token 管理
  // new-api 创建令牌后返回的是打码 key，完整 key 需再调 /token/:id/key 获取
  createToken: () =>
    api.post(
      '/token/',
      { name: 'imagerelay', remain_quota: -1, expired_time: -1, unlimited_quota: true },
      { headers: authHeaders() },
    ),

  getTokenKey: (id: number) =>
    api.post(`/token/${id}/key`, {}, { headers: authHeaders() }),

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
