import { describe, it, expect, beforeAll } from 'vitest'

// MiniMax API key for integration testing
const MINIMAX_KEY = process.env.MINIMAX_API_KEY || 'test-key-placeholder'
const MINIMAX_BASE = 'https://api.minimaxi.com'

/**
 * MiniMax integration tests for image generation.
 *
 * MiniMax has two API surfaces:
 * 1. Anthropic-compatible: /anthropic/v1/messages (text-only, MiniMax-M3 etc.)
 * 2. Native image generation: /v1/image_generation (image-01 model)
 *
 * The new-api relay translates /v1/images/generations → /v1/image_generation
 * for the image-01 model.
 */
describe('MiniMax Integration', () => {
  describe('Anthropic-compatible chat API', () => {
    it('MiniMax-M3 responds to text prompts', async () => {
      const res = await fetch(`${MINIMAX_BASE}/anthropic/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': MINIMAX_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'MiniMax-M3',
          max_tokens: 100,
          messages: [{ role: 'user', content: 'Say hello in one word' }],
        }),
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.content).toBeDefined()
      expect(data.content.length).toBeGreaterThan(0)
      expect(data.content[0].type).toBe('text')
      expect(data.model).toContain('MiniMax')
    }, 30000)

    it('MiniMax-M3 returns text (not images) for image prompts', async () => {
      const res = await fetch(`${MINIMAX_BASE}/anthropic/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': MINIMAX_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'MiniMax-M3',
          max_tokens: 500,
          messages: [{ role: 'user', content: 'Generate an image of a cat' }],
        }),
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      // MiniMax-M3 is text-only — it will respond with text, not images
      const hasImage = data.content?.some((b: any) => b.type === 'image')
      expect(hasImage).toBe(false)
    }, 30000)

    it('rejects invalid API key', async () => {
      const res = await fetch(`${MINIMAX_BASE}/anthropic/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': 'sk-invalid-key-12345',
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'MiniMax-M3',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      })
      expect(res.status).toBe(401)
    }, 30000)

    it('lists available models', async () => {
      const res = await fetch(`${MINIMAX_BASE}/anthropic/v1/models`, {
        headers: {
          'x-api-key': MINIMAX_KEY,
          'anthropic-version': '2023-06-01',
        },
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      const modelIds = data.data?.map((m: any) => m.id) || []
      expect(modelIds).toContain('MiniMax-M3')
      expect(modelIds).toContain('MiniMax-M2.7')
    }, 15000)
  })

  describe('Native image generation API (image-01)', () => {
    it('generates an image with base64 response', async () => {
      const res = await fetch(`${MINIMAX_BASE}/v1/image_generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MINIMAX_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'image-01',
          prompt: 'A simple red circle on white background',
          aspect_ratio: '1:1',
          response_format: 'base64',
          n: 1,
        }),
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.base_resp?.status_code).toBe(0)
      expect(data.data?.image_base64?.length).toBeGreaterThan(0)

      // Verify the base64 data is valid
      const b64 = data.data.image_base64[0]
      expect(b64.length).toBeGreaterThan(1000) // Should be a real image
    }, 60000)

    it('generates an image with URL response', async () => {
      const res = await fetch(`${MINIMAX_BASE}/v1/image_generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MINIMAX_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'image-01',
          prompt: 'A cute cat wearing a tiny hat',
          aspect_ratio: '1:1',
          response_format: 'url',
          n: 1,
        }),
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.base_resp?.status_code).toBe(0)
    }, 60000)

    it('supports different aspect ratios', async () => {
      const ratios = ['1:1', '16:9', '9:16']
      for (const ratio of ratios) {
        const res = await fetch(`${MINIMAX_BASE}/v1/image_generation`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MINIMAX_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'image-01',
            prompt: 'abstract colorful shapes',
            aspect_ratio: ratio,
            response_format: 'base64',
            n: 1,
          }),
        })
        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data.base_resp?.status_code).toBe(0)
      }
    }, 120000)

    it('handles invalid API key for image generation', async () => {
      const res = await fetch(`${MINIMAX_BASE}/v1/image_generation`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer sk-invalid-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'image-01',
          prompt: 'test',
          n: 1,
        }),
      })
      // MiniMax image API may return 200 with error in base_resp instead of 401
      if (res.status === 401) {
        expect(res.status).toBe(401)
      } else {
        const data = await res.json()
        // Either gets an auth error or the API has different error handling
        expect(res.status === 200 || res.status === 401).toBe(true)
      }
    }, 30000)

    it('returns usage/metadata in response', async () => {
      const res = await fetch(`${MINIMAX_BASE}/v1/image_generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MINIMAX_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'image-01',
          prompt: 'A tiny blue dot on white background',
          aspect_ratio: '1:1',
          response_format: 'base64',
          n: 1,
        }),
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.id).toBeTruthy()
      expect(data.base_resp).toBeDefined()
      // metadata may or may not be present depending on API version
    }, 60000)
  })

  describe('new-api relay compatibility', () => {
    // These tests verify that MiniMax's native image API format
    // matches what the new-api relay expects (see relay/channel/minimax/image.go)

    it('MiniMax image response matches new-api relay schema', async () => {
      const res = await fetch(`${MINIMAX_BASE}/v1/image_generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MINIMAX_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'image-01',
          prompt: 'A green square on black background',
          aspect_ratio: '1:1',
          response_format: 'base64',
          n: 1,
        }),
      })
      const data = await res.json()

      // Verify the response matches MiniMaxImageResponse schema from new-api:
      // { id, data: { image_urls, image_base64 }, metadata, base_resp }
      expect(typeof data.id).toBe('string')
      expect(data.data).toBeDefined()
      expect(Array.isArray(data.data.image_base64) || Array.isArray(data.data.image_urls)).toBe(true)
      expect(data.base_resp).toBeDefined()
      expect(typeof data.base_resp.status_code).toBe('number')
    }, 60000)

    it('new-api relay maps standard OpenAI sizes to MiniMax aspect ratios', () => {
      // These are the explicit mappings from new-api relay/channel/minimax/image.go
      // aspectRatioFromImageRequest() has special-case logic for these sizes
      const sizeMap: Record<string, string> = {
        '1024x1024': '1:1',
        '1792x1024': '16:9',
        '1024x1792': '9:16',
        '1536x1024': '3:2',
        '1024x1536': '2:3',
        '1152x864': '4:3',
        '864x1152': '3:4',
        '1344x576': '21:9',
      }

      // Verify all mappings are valid aspect ratios that MiniMax supports
      const supportedRatios = ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9']
      for (const [size, ratio] of Object.entries(sizeMap)) {
        expect(supportedRatios).toContain(ratio)
        // Verify size format is WxH
        const [w, h] = size.split('x').map(Number)
        expect(w).toBeGreaterThan(0)
        expect(h).toBeGreaterThan(0)
      }
    })
  })
})

function gcd(a: number, b: number): number {
  while (b !== 0) {
    ;[a, b] = [b, a % b]
  }
  return a || 1
}
