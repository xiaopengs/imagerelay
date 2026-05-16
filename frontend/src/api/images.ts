import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1' })

function authHeaders() {
  const token = localStorage.getItem('token') || ''
  return { Authorization: `Bearer ${token}` }
}

export const imagesApi = {
  generate: (params: {
    model?: string
    prompt: string
    n?: number
    size?: string
    style?: string
    input_image?: string // base64
  }) => {
    const body: Record<string, unknown> = {
      model: params.model || 'dall-e-3',
      prompt: params.prompt,
      n: params.n || 1,
      size: params.size || '1024x1024'
    }
    if (params.input_image) {
      body.input_image = params.input_image
    }
    return api.post('/images/generations', body, { headers: authHeaders() })
  }
}