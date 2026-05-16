import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1' })

function authHeaders() {
  const token = localStorage.getItem('token') || ''
  return { Authorization: `Bearer ${token}` }
}

export const userApi = {
  getMe: () => api.get('/users/me', { headers: authHeaders() }),
  topUp: (code: string) => api.post('/users/top_up', { token: code }, { headers: authHeaders() }),
  createToken: () => api.post('/tokens', {}, { headers: authHeaders() }),
  getTokens: () => api.get('/tokens', { headers: authHeaders() }),
  deleteToken: (id: number) => api.delete(`/tokens/${id}`, { headers: authHeaders() })
}