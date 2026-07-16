import axios from 'axios'

/**
 * OpenRouter API client for direct image generation testing.
 * OpenRouter provides OpenAI-compatible endpoints at https://openrouter.ai/api/v1
 */

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

function createClient(apiKey: string) {
  return axios.create({
    baseURL: OPENROUTER_BASE,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://imagerelay.app',
      'X-Title': 'ImageRelay',
    },
    timeout: 120000,
  })
}

export interface OpenRouterImageParams {
  model: string
  prompt: string
  size?: string
}

export interface OpenRouterImageResult {
  success: boolean
  imageData?: string  // base64 or URL
  error?: string
  model?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    cost: number
  }
}

/**
 * Generate an image using OpenRouter's chat completions API with image output.
 */
export async function generateImageViaOpenRouter(
  apiKey: string,
  params: OpenRouterImageParams
): Promise<OpenRouterImageResult> {
  const client = createClient(apiKey)

  try {
    const res = await client.post('/chat/completions', {
      model: params.model,
      messages: [
        {
          role: 'user',
          content: params.prompt,
        },
      ],
    })

    const data = res.data
    const choice = data?.choices?.[0]
    const message = choice?.message

    if (!message) {
      return { success: false, error: 'No response message from model' }
    }

    let imageData: string | undefined

    if (typeof message.content === 'string') {
      if (message.content.startsWith('data:')) {
        imageData = message.content
      }
    } else if (Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          imageData = part.image_url.url
          break
        }
        if (part.type === 'image' && part.source?.data) {
          imageData = `data:${part.source.media_type};base64,${part.source.data}`
          break
        }
        if (part.inline_data?.data) {
          imageData = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`
          break
        }
      }
    }

    if (!imageData) {
      const textContent = typeof message.content === 'string'
        ? message.content
        : JSON.stringify(message.content)
      return {
        success: false,
        error: `Model returned text instead of image: ${textContent.substring(0, 200)}`,
        model: data.model,
      }
    }

    return {
      success: true,
      imageData,
      model: data.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
        cost: data.usage.cost || 0,
      } : undefined,
    }
  } catch (e: any) {
    const msg = e?.response?.data?.error?.message
      || e?.response?.data?.message
      || e?.message
      || 'Unknown error'
    return { success: false, error: msg }
  }
}

/**
 * List available image generation models on OpenRouter.
 * Note: The /models endpoint is public and doesn't require authentication.
 */
export async function listImageModels(apiKey?: string): Promise<Array<{
  id: string
  name: string
  pricing: { prompt: number; completion: number }
  modality: string
}>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const res = await axios.get(`${OPENROUTER_BASE}/models`, { headers })
    const models = res.data?.data || []

    return models
      .filter((m: any) => {
        const outMods = m.architecture?.output_modalities || []
        return outMods.includes('image')
      })
      .map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        pricing: {
          prompt: parseFloat(m.pricing?.prompt || '0'),
          completion: parseFloat(m.pricing?.completion || '0'),
        },
        modality: m.architecture?.modality || '',
      }))
      .sort((a: any, b: any) => a.pricing.prompt - b.pricing.prompt)
  } catch {
    return []
  }
}

/**
 * Check if an API key is valid by making a lightweight chat completions request.
 * The /models endpoint is public, so we use /chat/completions to verify the key.
 */
export async function validateApiKey(apiKey: string): Promise<{
  valid: boolean
  error?: string
  label?: string
}> {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, error: 'API Key 不能为空' }
  }

  const client = createClient(apiKey)

  try {
    // Use a minimal chat completion request to verify the key
    const res = await client.post('/chat/completions', {
      model: 'openrouter/free',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 1,
    })
    return { valid: true, label: 'OpenRouter' }
  } catch (e: any) {
    const status = e?.response?.status
    if (status === 401 || status === 403) {
      return { valid: false, error: 'API Key 无效或已过期' }
    }
    if (status === 402) {
      // 402 means key is valid but insufficient credits
      return { valid: true, label: 'OpenRouter (余额不足)' }
    }
    if (status === 429) {
      // Rate limited = key is valid
      return { valid: true, label: 'OpenRouter' }
    }
    return { valid: false, error: e?.message || '验证失败' }
  }
}
