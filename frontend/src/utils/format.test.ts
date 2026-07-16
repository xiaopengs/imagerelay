import { describe, it, expect } from 'vitest'
import { formatBalance, quotaToBalance } from './format'

describe('formatBalance', () => {
  it('converts 500000 quota to "1.0 积分"', () => {
    expect(formatBalance(500000)).toBe('1.0 积分')
  })

  it('converts 0 quota to "0.0 积分"', () => {
    expect(formatBalance(0)).toBe('0.0 积分')
  })

  it('converts 2500000 quota to "5.0 积分"', () => {
    expect(formatBalance(2500000)).toBe('5.0 积分')
  })

  it('handles fractional values', () => {
    expect(formatBalance(100000)).toBe('0.2 积分')
  })

  it('handles negative values', () => {
    expect(formatBalance(-500000)).toBe('-1.0 积分')
  })

  it('handles large values', () => {
    expect(formatBalance(50000000)).toBe('100.0 积分')
  })
})

describe('quotaToBalance', () => {
  it('converts 500000 to 1', () => {
    expect(quotaToBalance(500000)).toBe(1)
  })

  it('converts 0 to 0', () => {
    expect(quotaToBalance(0)).toBe(0)
  })

  it('converts 1500000 to 3', () => {
    expect(quotaToBalance(1500000)).toBe(3)
  })
})
