import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  server: {
    port: 5173,
    proxy: {
      // 支付 API 必须在 /api 之前（最长前缀匹配）
      '/api/pay': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // 管理 API → new-api
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Relay API → new-api（生图等 OpenAI 兼容接口）
      '/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    }
  }
})
