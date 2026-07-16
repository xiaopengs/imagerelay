import { describe, it, expect } from 'vitest'
import { getGradient, getEmoji, replaceArguments } from './promptHelpers'

describe('getGradient', () => {
  it('returns a gradient for numeric IDs', () => {
    const result = getGradient('p001')
    expect(result).toContain(',')
    expect(result).toContain('#')
  })

  it('returns first gradient for non-numeric IDs', () => {
    const result = getGradient('abc')
    expect(result).toBeTruthy()
  })

  it('returns consistent results for same ID', () => {
    expect(getGradient('p005')).toBe(getGradient('p005'))
  })

  it('returns different gradients for different IDs', () => {
    expect(getGradient('p001')).not.toBe(getGradient('p030'))
  })
})

describe('getEmoji', () => {
  it('returns emoji for known subject', () => {
    const prompt = { categories: { subjects: ['portrait-selfie'] } }
    const emoji = getEmoji(prompt as any)
    expect(emoji).toBe('\u{1F464}')
  })

  it('returns default emoji for unknown subject', () => {
    const prompt = { categories: { subjects: ['unknown-subject'] } }
    const emoji = getEmoji(prompt as any)
    expect(emoji).toBe('\u{1F3A8}')
  })

  it('returns default emoji for empty subjects', () => {
    const prompt = { categories: { subjects: [] } }
    const emoji = getEmoji(prompt as any)
    expect(emoji).toBe('\u{1F3A8}')
  })
})

describe('replaceArguments', () => {
  it('replaces single placeholder', () => {
    expect(replaceArguments('Hello {name}', { name: 'World' })).toBe('Hello World')
  })

  it('replaces multiple different placeholders', () => {
    expect(replaceArguments('{greeting} {name}', { greeting: 'Hi', name: 'Alice' }))
      .toBe('Hi Alice')
  })

  it('replaces repeated placeholders', () => {
    expect(replaceArguments('{x} and {x}', { x: '1' })).toBe('1 and 1')
  })

  it('removes placeholder when value is empty', () => {
    expect(replaceArguments('Hello {name}!', { name: '' })).toBe('Hello !')
  })

  it('leaves unmatched placeholders as-is', () => {
    expect(replaceArguments('Hello {name}!', {})).toBe('Hello {name}!')
  })

  it('handles no placeholders', () => {
    expect(replaceArguments('No placeholders', { name: 'test' })).toBe('No placeholders')
  })

  it('handles real prompt content', () => {
    const content = 'Create a cinematic portrait of {subject}, shallow depth of field'
    const result = replaceArguments(content, { subject: 'a woman in a cafe' })
    expect(result).toBe('Create a cinematic portrait of a woman in a cafe, shallow depth of field')
  })
})
