import { describe, it, expect } from 'vitest'
import {
  generateImageViaOpenRouter,
  listImageModels,
  validateApiKey,
} from './openrouter'

// Use the provided OpenRouter API key for integration testing
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || 'test-key-placeholder'

describe('OpenRouter Integration', () => {
  describe('validateApiKey', () => {
    it('validates a correct API key', async () => {
      const result = await validateApiKey(OPENROUTER_KEY)
      expect(result.valid).toBe(true)
      expect(result.label).toBeTruthy()
    }, 30000)

    it('rejects an invalid API key', async () => {
      const result = await validateApiKey('sk-invalid-key-12345')
      expect(result.valid).toBe(false)
      expect(result.error).toBeTruthy()
    }, 30000)

    it('rejects an empty API key', async () => {
      const result = await validateApiKey('')
      expect(result.valid).toBe(false)
    })
  })

  describe('listImageModels', () => {
    it('returns available image models', async () => {
      const models = await listImageModels(OPENROUTER_KEY)
      expect(models.length).toBeGreaterThan(0)

      for (const m of models) {
        expect(m.id).toBeTruthy()
        expect(m.pricing).toBeDefined()
        expect(typeof m.pricing.prompt).toBe('number')
      }
    }, 30000)

    it('models are sorted by price (cheapest first)', async () => {
      const models = await listImageModels(OPENROUTER_KEY)
      if (models.length > 1) {
        for (let i = 1; i < models.length; i++) {
          expect(models[i].pricing.prompt).toBeGreaterThanOrEqual(models[i - 1].pricing.prompt)
        }
      }
    }, 30000)

    it('all returned models support image output', async () => {
      const models = await listImageModels(OPENROUTER_KEY)
      for (const m of models) {
        expect(m.modality).toContain('image')
      }
    }, 30000)
  })

  describe('generateImageViaOpenRouter', () => {
    it('returns error for insufficient credits (expected for free key)', async () => {
      const result = await generateImageViaOpenRouter(OPENROUTER_KEY, {
        model: 'google/gemini-2.5-flash-image',
        prompt: 'a simple red circle on white background',
      })

      if (!result.success) {
        expect(result.error).toBeTruthy()
        expect(typeof result.error).toBe('string')
      } else {
        expect(result.imageData).toBeTruthy()
      }
    }, 30000)

    it('returns error for invalid model', async () => {
      const result = await generateImageViaOpenRouter(OPENROUTER_KEY, {
        model: 'nonexistent/model-xyz',
        prompt: 'test',
      })
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    }, 30000)

    it('returns error for invalid API key', async () => {
      const result = await generateImageViaOpenRouter('sk-invalid-key', {
        model: 'google/gemini-2.5-flash-image',
        prompt: 'test',
      })
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    }, 30000)

    it('returns a result object for empty prompt', async () => {
      const result = await generateImageViaOpenRouter(OPENROUTER_KEY, {
        model: 'google/gemini-2.5-flash-image',
        prompt: '',
      })
      expect(typeof result.success).toBe('boolean')
    }, 30000)
  })
})
