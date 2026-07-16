import { describe, it, expect } from 'vitest'
import { galleryApi } from './gallery'

describe('galleryApi', () => {
  describe('getAll', () => {
    it('returns all prompts', () => {
      const all = galleryApi.getAll()
      expect(all.length).toBeGreaterThan(0)
    })

    it('each prompt has required fields', () => {
      const all = galleryApi.getAll()
      for (const p of all) {
        expect(p.id).toBeTruthy()
        expect(p.title).toBeTruthy()
        expect(p.content).toBeTruthy()
        expect(p.categories).toBeDefined()
        expect(p.categories.useCases).toBeDefined()
        expect(p.categories.styles).toBeDefined()
        expect(p.categories.subjects).toBeDefined()
        expect(Array.isArray(p.arguments)).toBe(true)
        expect(typeof p.featured).toBe('boolean')
      }
    })

    it('all IDs are unique', () => {
      const all = galleryApi.getAll()
      const ids = all.map(p => p.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('getFeatured', () => {
    it('returns only featured prompts', () => {
      const featured = galleryApi.getFeatured()
      for (const p of featured) {
        expect(p.featured).toBe(true)
      }
    })

    it('returns fewer items than getAll', () => {
      const all = galleryApi.getAll()
      const featured = galleryApi.getFeatured()
      expect(featured.length).toBeLessThanOrEqual(all.length)
    })
  })

  describe('search', () => {
    it('finds prompts by title', () => {
      const results = galleryApi.search('人像')
      expect(results.length).toBeGreaterThan(0)
      for (const p of results) {
        const match = p.title.includes('人像') ||
          p.titleEn.toLowerCase().includes('人像') ||
          p.content.toLowerCase().includes('人像') ||
          p.description.includes('人像')
        expect(match).toBe(true)
      }
    })

    it('search is case-insensitive', () => {
      const results1 = galleryApi.search('portrait')
      const results2 = galleryApi.search('Portrait')
      expect(results1.length).toBe(results2.length)
    })

    it('returns empty for non-matching query', () => {
      const results = galleryApi.search('xyznonexistent123')
      expect(results.length).toBe(0)
    })

    it('searches in content field', () => {
      const all = galleryApi.getAll()
      if (all.length > 0) {
        const firstContent = all[0].content.substring(0, 10)
        const results = galleryApi.search(firstContent)
        expect(results.length).toBeGreaterThanOrEqual(1)
      }
    })
  })

  describe('getByCategory', () => {
    it('returns prompts matching category in useCases', () => {
      const results = galleryApi.getByCategory('profile-avatar')
      for (const p of results) {
        const match = p.categories.useCases.includes('profile-avatar') ||
          p.categories.styles.includes('profile-avatar') ||
          p.categories.subjects.includes('profile-avatar')
        expect(match).toBe(true)
      }
    })

    it('returns empty for non-existent category', () => {
      const results = galleryApi.getByCategory('nonexistent-category')
      expect(results.length).toBe(0)
    })
  })

  describe('getById', () => {
    it('returns prompt by ID', () => {
      const all = galleryApi.getAll()
      if (all.length > 0) {
        const first = all[0]
        const found = galleryApi.getById(first.id)
        expect(found).toBeDefined()
        expect(found?.id).toBe(first.id)
      }
    })

    it('returns undefined for non-existent ID', () => {
      const found = galleryApi.getById('nonexistent-id-99999')
      expect(found).toBeUndefined()
    })
  })
})
