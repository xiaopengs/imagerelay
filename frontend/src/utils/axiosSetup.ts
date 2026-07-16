import axios from 'axios'
import { useToast } from '@/utils/toast'

/**
 * Setup global Axios interceptors for error handling.
 * Call this once in main.ts after app creation.
 *
 * The toast instance is obtained lazily inside the interceptor callback
 * so it works regardless of when setupAxiosInterceptors() is called
 * relative to Pinia initialization.
 */
export function setupAxiosInterceptors() {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status
      const message = error?.response?.data?.message || error?.message || ''

      if (status === 401) {
        // Clear auth state and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('apiKey')

        const currentPath = window.location.pathname
        // Don't redirect if already on login/register page
        if (!['/login', '/register'].includes(currentPath)) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&expired=1`
        }
      } else if (error?.code === 'ECONNABORTED' || message?.includes('timeout')) {
        useToast().error('请求超时，请检查网络后重试')
      } else if (!error?.response) {
        // Network error (no response at all)
        useToast().error('网络连接失败，请检查网络')
      }
      // Don't show toast for 400/422 etc — let the calling component handle those

      return Promise.reject(error)
    }
  )
}
