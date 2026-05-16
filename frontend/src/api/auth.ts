import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1' })

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/users/login', { email, password }),
  register: (email: string, password: string) =>
    api.post('/users/register', { email, password }),
  getMe: () => api.get('/users/me')
}