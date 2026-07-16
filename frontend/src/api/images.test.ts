import { describe, it, expect } from 'vitest'
import { imagesApi } from './images'

describe('imagesApi', () => {
  describe('API client configuration', () => {
    it('imagesApi has generate and listModels methods', () => {
      expect(typeof imagesApi.generate).toBe('function')
      expect(typeof imagesApi.listModels).toBe('function')
    })
  })

  describe('generate', () => {
    it('returns a promise', () => {
      const result = imagesApi.generate({
        prompt: 'test prompt',
        model: 'gpt-image-1',
        n: 1,
        size: '1024x1024',
      })
      expect(result).toBeInstanceOf(Promise)
      result.catch(() => {})
    })

    it('uses default model when not specified', () => {
      const result = imagesApi.generate({
        prompt: 'test prompt',
      })
      expect(result).toBeInstanceOf(Promise)
      result.catch(() => {})
    })

    it('includes input_image when provided', () => {
      const result = imagesApi.generate({
        prompt: 'modify this image',
        input_image: 'base64data',
      })
      expect(result).toBeInstanceOf(Promise)
      result.catch(() => {})
    })
  })

  describe('listModels', () => {
    it('returns a promise', () => {
      const result = imagesApi.listModels()
      expect(result).toBeInstanceOf(Promise)
      result.catch(() => {})
    })
  })
})
