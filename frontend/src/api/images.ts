import axios from 'axios'

// Relay 接口 — baseURL 为 /v1（new-api 的 OpenAI 兼容路由在 /v1/* 下）
const api = axios.create({ baseURL: '/v1' })

function apiKeyHeaders() {
  const apiKey = localStorage.getItem('apiKey') || ''
  return { Authorization: `Bearer ${apiKey}` }
}

export interface GenerateParams {
  model?: string
  prompt: string
  n?: number
  size?: string
  input_image?: string
}

export const imagesApi = {
  generate: (params: GenerateParams) => {
    const body: Record<string, unknown> = {
      model: params.model || 'gpt-image-1',
      prompt: params.prompt,
      n: params.n || 1,
      size: params.size || '1024x1024',
    }
    if (params.input_image) {
      body.input_image = params.input_image
    }
    return api.post('/images/generations', body, {
      headers: apiKeyHeaders(),
      timeout: 120000,
    })
  },

  listModels: () =>
    api.get('/models', { headers: apiKeyHeaders() }),
}
