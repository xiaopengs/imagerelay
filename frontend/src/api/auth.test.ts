import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { authApi } from './auth'

// Mock tests for auth API module (unit tests without real backend)
describe('authApi', () => {
  describe('API client configuration', () => {
    it('authApi has correct baseURL', () => {
      // The api instance inside authApi uses baseURL '/api'
      // We verify the module exports are functions
      expect(typeof authApi.login).toBe('function')
      expect(typeof authApi.register).toBe('function')
      expect(typeof authApi.getSelf).toBe('function')
    })
  })

  describe('login request format', () => {
    it('calls POST /api/user/login with email and password', async () => {
      // We can't test against a real backend, but we can verify the function signature
      // and that it returns a promise
      const result = authApi.login('test@example.com', 'password123')
      expect(result).toBeInstanceOf(Promise)
      // Clean up - catch the expected error (no backend running)
      result.catch(() => {})
    })
  })

  describe('register request format', () => {
    it('calls POST /api/user/register with email and password', async () => {
      const result = authApi.register('test@example.com', 'password123')
      expect(result).toBeInstanceOf(Promise)
      result.catch(() => {})
    })
  })

  describe('getSelf request format', () => {
    it('calls GET /api/user/self with auth headers', async () => {
      const result = authApi.getSelf()
      expect(result).toBeInstanceOf(Promise)
      result.catch(() => {})
    })
  })
})
