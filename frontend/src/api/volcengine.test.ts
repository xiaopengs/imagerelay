import { describe, it, expect } from 'vitest'
import {
  SEEDREAM_MODELS,
  SEEDANCE_MODELS,
  DOUBAO_CREATIVE_MODELS,
  isSeedreamModel,
  isSeedanceModel,
  SEEDREAM_SIZES,
} from './volcengine'

describe('VolcEngine / Doubao Seedream API', () => {
  describe('Model classification', () => {
    it('identifies Seedream models correctly', () => {
      expect(isSeedreamModel('doubao-seedream-5-0-pro-260628')).toBe(true)
      expect(isSeedreamModel('doubao-seedream-5-0-260128')).toBe(true)
      expect(isSeedreamModel('doubao-seedream-5-0-lite-260128')).toBe(true)
      expect(isSeedreamModel('doubao-seedream-4-5-251128')).toBe(true)
      expect(isSeedreamModel('doubao-seedream-4-0-250828')).toBe(true)
      expect(isSeedreamModel('doubao-seedance-2-0-260128')).toBe(false)
      expect(isSeedreamModel('gpt-image-1')).toBe(false)
    })

    it('identifies Seedance models correctly', () => {
      expect(isSeedanceModel('doubao-seedance-2-0-260128')).toBe(true)
      expect(isSeedanceModel('doubao-seedance-2-0-fast-260128')).toBe(true)
      expect(isSeedanceModel('doubao-seedance-1-5-pro-251215')).toBe(true)
      expect(isSeedanceModel('doubao-seedance-1-0-pro-250528')).toBe(true)
      expect(isSeedanceModel('doubao-seedream-5-0-pro-260628')).toBe(false)
      expect(isSeedanceModel('image-01')).toBe(false)
    })
  })

  describe('Model lists', () => {
    it('has Seedream image models', () => {
      expect(SEEDREAM_MODELS.length).toBeGreaterThanOrEqual(5)
      expect(SEEDREAM_MODELS.every(m => m.type === 'image')).toBe(true)
      expect(SEEDREAM_MODELS.some(m => m.id.includes('seedream-5-0-pro'))).toBe(true)
      expect(SEEDREAM_MODELS.some(m => m.id.includes('seedream-5-0-lite'))).toBe(true)
    })

    it('has Seedance video models', () => {
      expect(SEEDANCE_MODELS.length).toBeGreaterThanOrEqual(4)
      expect(SEEDANCE_MODELS.every(m => m.type === 'video')).toBe(true)
      expect(SEEDANCE_MODELS.some(m => m.id.includes('seedance-2-0'))).toBe(true)
    })

    it('combines all creative models', () => {
      expect(DOUBAO_CREATIVE_MODELS.length).toBe(
        SEEDREAM_MODELS.length + SEEDANCE_MODELS.length
      )
    })

    it('every model has id and label', () => {
      for (const m of DOUBAO_CREATIVE_MODELS) {
        expect(m.id).toBeTruthy()
        expect(m.label).toBeTruthy()
        expect(m.type).toMatch(/^(image|video)$/)
      }
    })

    it('includes Seedream 5.0 Pro as first image model', () => {
      expect(SEEDREAM_MODELS[0].id).toBe('doubao-seedream-5-0-pro-260628')
      expect(SEEDREAM_MODELS[0].label).toContain('5.0 Pro')
    })
  })

  describe('Size options', () => {
    it('has standard and special sizes', () => {
      const sizeValues = SEEDREAM_SIZES.map(s => s.value)
      expect(sizeValues).toContain('1024x1024')
      expect(sizeValues).toContain('2K')
      expect(sizeValues).toContain('1K')
    })

    it('every size has label and value', () => {
      for (const s of SEEDREAM_SIZES) {
        expect(s.label).toBeTruthy()
        expect(s.value).toBeTruthy()
      }
    })
  })

  describe('API client', () => {
    it('generateImageViaVolcEngine is a function', async () => {
      const { generateImageViaVolcEngine } = await import('./volcengine')
      expect(typeof generateImageViaVolcEngine).toBe('function')
    })

    it('validateVolcEngineApiKey is a function', async () => {
      const { validateVolcEngineApiKey } = await import('./volcengine')
      expect(typeof validateVolcEngineApiKey).toBe('function')
    })

    it('rejects empty API key', async () => {
      const { validateVolcEngineApiKey } = await import('./volcengine')
      const result = await validateVolcEngineApiKey('')
      expect(result.valid).toBe(false)
    })

    it('rejects whitespace-only API key', async () => {
      const { validateVolcEngineApiKey } = await import('./volcengine')
      const result = await validateVolcEngineApiKey('   ')
      expect(result.valid).toBe(false)
    })
  })
})
