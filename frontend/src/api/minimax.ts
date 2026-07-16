import axios from 'axios'

/**
 * MiniMax API client for image generation.
 *
 * MiniMax has two API surfaces:
 * 1. Anthropic-compatible chat: /anthropic/v1/messages (MiniMax-M3, text-only)
 * 2. Native image generation: /v1/image_generation (image-01, produces images)
 *
 * When going through the new-api relay, /v1/images/generations is translated
 * to MiniMax's /v1/image_generation endpoint automatically.
 *
 * This module provides direct access to both APIs for testing and fallback.
 */

const MINIMAX_BASE = 'https://api.minimaxi.com'

function createNativeClient(apiKey: string) {
  return axios.create({
    baseURL: MINIMAX_BASE,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 120000,
  })
}

function createAnthropicClient(apiKey: string) {
  return axios.create({
    baseURL: `${MINIMAX_BASE}/anthropic`,
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    timeout: 120000,
  })
}

// --- Native Image Generation API ---

export interface MiniMaxImageParams {
  model?: string
  prompt: string
  aspectRatio?: string
  responseFormat?: 'url' | 'base64'
  n?: number
  promptOptimizer?: boolean
  watermark?: boolean
}

export interface MiniMaxImageResult {
  success: boolean
  imageData?: string  // base64 data URL or remote URL
  imageUrls?: string[]
  imageBase64?: string[]
  model?: string
  id?: string
  error?: string
}

/**
 * Generate an image using MiniMax's native image_generation API.
 * This is the endpoint that actually produces images (image-01 model).
 */
export async function generateImageViaMiniMax(
  apiKey: string,
  params: MiniMaxImageParams
): Promise<MiniMaxImageResult> {
  const client = createNativeClient(apiKey)

  try {
    const body: Record<string, unknown> = {
      model: params.model || 'image-01',
      prompt: params.prompt,
      response_format: params.responseFormat || 'base64',
      n: params.n || 1,
    }
    if (params.aspectRatio) {
      body.aspect_ratio = params.aspectRatio
    }
    if (params.promptOptimizer !== undefined) {
      body.prompt_optimizer = params.promptOptimizer
    }
    if (params.watermark !== undefined) {
      body.aigc_watermark = params.watermark
    }

    const res = await client.post('/v1/image_generation', body)
    const data = res.data

    // Check for API errors in base_resp
    if (data.base_resp?.status_code !== 0) {
      return {
        success: false,
        error: data.base_resp?.status_msg || 'MiniMax image generation failed',
      }
    }

    const imageBase64 = data.data?.image_base64 || []
    const imageUrls = data.data?.image_urls || []

    // Convert base64 to data URLs for display
    let imageData: string | undefined
    if (imageBase64.length > 0) {
      imageData = `data:image/png;base64,${imageBase64[0]}`
    } else if (imageUrls.length > 0) {
      imageData = imageUrls[0]
    }

    return {
      success: !!imageData,
      imageData,
      imageUrls,
      imageBase64,
      model: data.model || params.model,
      id: data.id,
    }
  } catch (e: any) {
    const status = e?.response?.status
    const msg = e?.response?.data?.base_resp?.status_msg
      || e?.response?.data?.error?.message
      || e?.response?.data?.message
      || e?.message
      || 'Unknown error'
    return {
      success: false,
      error: `HTTP ${status || 'N/A'}: ${msg}`,
    }
  }
}

// --- Anthropic Chat API ---

export interface MiniMaxChatParams {
  model: string
  prompt: string
  max_tokens?: number
}

export interface MiniMaxChatResult {
  success: boolean
  textContent?: string
  imageData?: string
  model?: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
  error?: string
}

/**
 * Send a chat message via MiniMax's Anthropic-compatible API.
 * Note: MiniMax-M3 is text-only, it cannot generate images.
 */
export async function chatViaMiniMax(
  apiKey: string,
  params: MiniMaxChatParams
): Promise<MiniMaxChatResult> {
  const client = createAnthropicClient(apiKey)

  try {
    const res = await client.post('/v1/messages', {
      model: params.model,
      max_tokens: params.max_tokens || 1000,
      messages: [
        { role: 'user', content: params.prompt },
      ],
    })

    const data = res.data
    const contentBlocks = data?.content || []

    let imageData: string | undefined
    let textContent: string | undefined

    for (const block of contentBlocks) {
      if (block.type === 'image' && block.source) {
        const mediaType = block.source.media_type || block.source.mime_type || 'image/png'
        imageData = `data:${mediaType};base64,${block.source.data}`
        break
      }
      if (block.type === 'text') {
        textContent = (textContent || '') + block.text
      }
    }

    return {
      success: true,
      textContent,
      imageData,
      model: data.model,
      usage: data.usage ? {
        inputTokens: data.usage.input_tokens || 0,
        outputTokens: data.usage.output_tokens || 0,
      } : undefined,
    }
  } catch (e: any) {
    const status = e?.response?.status
    const msg = e?.response?.data?.error?.message
      || e?.response?.data?.message
      || e?.message
      || 'Unknown error'
    return {
      success: false,
      error: `HTTP ${status || 'N/A'}: ${msg}`,
    }
  }
}

// --- Validation ---

/**
 * Validate a MiniMax API key by making a minimal request.
 */
export async function validateMiniMaxApiKey(apiKey: string): Promise<{
  valid: boolean
  error?: string
  label?: string
}> {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, error: 'API Key 不能为空' }
  }

  const client = createAnthropicClient(apiKey)

  try {
    await client.post('/v1/messages', {
      model: 'MiniMax-M3',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ping' }],
    })
    return { valid: true, label: 'MiniMax' }
  } catch (e: any) {
    const status = e?.response?.status
    if (status === 401 || status === 403) {
      return { valid: false, error: 'API Key 无效或已过期' }
    }
    if (status === 429) {
      return { valid: true, label: 'MiniMax' }
    }
    if (status === 400) {
      return { valid: true, label: 'MiniMax' }
    }
    return { valid: false, error: e?.message || '验证失败' }
  }
}

// --- Aspect ratio helper (mirrors new-api relay logic) ---

export function sizeToAspectRatio(size: string): string {
  const mapping: Record<string, string> = {
    '1024x1024': '1:1',
    '1792x1024': '16:9',
    '1024x1792': '9:16',
    '1536x1024': '3:2',
    '1248x832': '3:2',
    '1024x1536': '2:3',
    '832x1248': '2:3',
    '1152x864': '4:3',
    '864x1152': '3:4',
    '1344x576': '21:9',
  }
  if (mapping[size]) return mapping[size]

  // Fallback: compute GCD ratio and check if it's a supported ratio
  const [w, h] = size.split('x').map(Number)
  if (!w || !h) return '1:1'
  const g = gcd(w, h)
  const ratio = `${w / g}:${h / g}`
  const supported = ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9']
  return supported.includes(ratio) ? ratio : '1:1'
}

function gcd(a: number, b: number): number {
  while (b !== 0) {
    ;[a, b] = [b, a % b]
  }
  return a || 1
}
