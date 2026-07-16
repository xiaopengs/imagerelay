import axios from 'axios'

/**
 * VolcEngine / Doubao Seedream API client for image generation.
 *
 * Doubao Seedream models are accessed via the VolcEngine Ark platform
 * using an OpenAI-compatible Images API at:
 *   https://ark.cn-beijing.volces.com/api/v3/images/generations
 *
 * When going through the new-api relay (channel type: VolcEngine),
 * /v1/images/generations is translated to the Ark endpoint automatically.
 *
 * This module provides direct access for testing and fallback,
 * plus a list of supported Seedream/Seedance model IDs.
 */

const VOLCENGINE_BASE = 'https://ark.cn-beijing.volces.com/api/v3'

// --- Supported models ---

/** Seedream image generation models (文生图 / 图生图) */
export const SEEDREAM_MODELS = [
  { id: 'doubao-seedream-5-0-pro-260628', label: 'Seedream 5.0 Pro', type: 'image' as const },
  { id: 'doubao-seedream-5-0-260128', label: 'Seedream 5.0', type: 'image' as const },
  { id: 'doubao-seedream-5-0-lite-260128', label: 'Seedream 5.0 Lite', type: 'image' as const },
  { id: 'doubao-seedream-4-5-251128', label: 'Seedream 4.5', type: 'image' as const },
  { id: 'doubao-seedream-4-0-250828', label: 'Seedream 4.0', type: 'image' as const },
]

/** Seedance video generation models (文生视频 / 图生视频) */
export const SEEDANCE_MODELS = [
  { id: 'doubao-seedance-2-0-260128', label: 'Seedance 2.0', type: 'video' as const },
  { id: 'doubao-seedance-2-0-fast-260128', label: 'Seedance 2.0 Fast', type: 'video' as const },
  { id: 'doubao-seedance-1-5-pro-251215', label: 'Seedance 1.5 Pro', type: 'video' as const },
  { id: 'doubao-seedance-1-0-pro-250528', label: 'Seedance 1.0 Pro', type: 'video' as const },
]

/** All Doubao creative models */
export const DOUBAO_CREATIVE_MODELS = [...SEEDREAM_MODELS, ...SEEDANCE_MODELS]

/** Check if a model ID is a Seedream (image) model */
export function isSeedreamModel(modelId: string): boolean {
  return modelId.includes('seedream')
}

/** Check if a model ID is a Seedance (video) model */
export function isSeedanceModel(modelId: string): boolean {
  return modelId.includes('seedance')
}

// --- API Client ---

function createClient(apiKey: string) {
  return axios.create({
    baseURL: VOLCENGINE_BASE,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 120000,
  })
}

// --- Image Generation API (Seedream) ---

export interface SeedreamImageParams {
  model: string
  prompt: string
  size?: string
  n?: number
  responseFormat?: 'url' | 'b64_json'
  outputFormat?: 'png' | 'jpeg' | 'webp'
  watermark?: boolean
  image?: string | string[]  // Reference image(s) for 图生图
  sequentialImageGeneration?: 'auto' | 'disabled'
  sequentialImageGenerationPrompt?: string
}

export interface SeedreamImageResult {
  success: boolean
  images?: Array<{
    url?: string
    b64_json?: string
  }>
  model?: string
  created?: number
  error?: string
}

/**
 * Generate an image using VolcEngine Ark's /images/generations API.
 * Compatible with OpenAI Images API format, with extra Seedream-specific fields.
 */
export async function generateImageViaVolcEngine(
  apiKey: string,
  params: SeedreamImageParams
): Promise<SeedreamImageResult> {
  const client = createClient(apiKey)

  try {
    const body: Record<string, unknown> = {
      model: params.model,
      prompt: params.prompt,
      response_format: params.responseFormat || 'url',
    }

    if (params.size) {
      body.size = params.size
    }
    if (params.n) {
      body.n = params.n
    }
    if (params.outputFormat) {
      body.output_format = params.outputFormat
    }
    if (params.watermark !== undefined) {
      body.watermark = params.watermark
    }
    if (params.image) {
      body.image = params.image
    }
    if (params.sequentialImageGeneration) {
      body.sequential_image_generation = params.sequentialImageGeneration
    }
    if (params.sequentialImageGenerationPrompt) {
      body.sequential_image_generation_prompt = params.sequentialImageGenerationPrompt
    }

    const res = await client.post('/images/generations', body)
    const data = res.data

    // OpenAI-compatible response format
    const images = (data.data || []).map((item: any) => ({
      url: item.url,
      b64_json: item.b64_json,
    }))

    return {
      success: images.length > 0,
      images,
      model: data.model || params.model,
      created: data.created,
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

// --- Size helpers ---

/**
 * Seedream supports standard OpenAI sizes plus special size keywords.
 */
export const SEEDREAM_SIZES = [
  { label: '1024×1024', value: '1024x1024' },
  { label: '768×1024', value: '768x1024' },
  { label: '1024×768', value: '1024x768' },
  { label: '512×1024', value: '512x1024' },
  { label: '1024×512', value: '1024x512' },
  { label: '2K', value: '2K' },
  { label: '1K', value: '1K' },
  { label: '512×512', value: '512x512' },
]

// --- Validation ---

/**
 * Validate a VolcEngine API key by making a minimal request.
 */
export async function validateVolcEngineApiKey(apiKey: string): Promise<{
  valid: boolean
  error?: string
  label?: string
}> {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, error: 'API Key 不能为空' }
  }

  const client = createClient(apiKey)

  try {
    // Try listing models as a lightweight validation
    const res = await client.get('/models')
    return { valid: true, label: 'VolcEngine' }
  } catch (e: any) {
    const status = e?.response?.status
    if (status === 401 || status === 403) {
      return { valid: false, error: 'API Key 无效或已过期' }
    }
    if (status === 429) {
      return { valid: true, label: 'VolcEngine' }
    }
    // Other errors might still mean the key is valid
    if (status === 400 || status === 404) {
      return { valid: true, label: 'VolcEngine' }
    }
    return { valid: false, error: e?.message || '验证失败' }
  }
}
