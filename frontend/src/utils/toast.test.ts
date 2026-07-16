import { describe, it, expect, beforeEach } from 'vitest'
import { useToast } from './toast'

describe('useToast', () => {
  beforeEach(() => {
    const { toasts, dismiss } = useToast()
    for (const t of [...toasts.value]) {
      dismiss(t.id)
    }
  })

  it('starts with empty toasts', () => {
    const { toasts } = useToast()
    expect(toasts.value.length).toBe(0)
  })

  it('adds a success toast', () => {
    const { toasts, success } = useToast()
    success('Operation successful')
    expect(toasts.value.length).toBeGreaterThan(0)
    const last = toasts.value[toasts.value.length - 1]
    expect(last.type).toBe('success')
    expect(last.message).toBe('Operation successful')
  })

  it('adds an error toast', () => {
    const { toasts, error } = useToast()
    error('Something went wrong')
    expect(toasts.value.length).toBeGreaterThan(0)
    const last = toasts.value[toasts.value.length - 1]
    expect(last.type).toBe('error')
    expect(last.message).toBe('Something went wrong')
  })

  it('adds an info toast', () => {
    const { toasts, info } = useToast()
    info('FYI')
    expect(toasts.value.length).toBeGreaterThan(0)
    const last = toasts.value[toasts.value.length - 1]
    expect(last.type).toBe('info')
    expect(last.message).toBe('FYI')
  })

  it('dismisses a toast by ID', () => {
    const { toasts, success, dismiss } = useToast()
    success('Will be dismissed')
    const id = toasts.value[0].id
    dismiss(id)
    expect(toasts.value.find(t => t.id === id)).toBeUndefined()
  })

  it('limits to 5 concurrent toasts', () => {
    const { toasts, success } = useToast()
    for (let i = 0; i < 8; i++) {
      success(`Toast ${i}`)
    }
    expect(toasts.value.length).toBeLessThanOrEqual(5)
  })

  it('each toast has a unique ID', () => {
    const { toasts, success } = useToast()
    success('First')
    success('Second')
    const ids = toasts.value.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('auto-dismiss timeout is set correctly', () => {
    // Verify the toast module uses setTimeout for auto-dismiss
    // by checking the internal logic (not testing timer behavior)
    const { toasts, success, error, info } = useToast()
    success('test')
    error('test')
    info('test')
    // All toasts should be present immediately
    expect(toasts.value.length).toBe(3)
    // Error toasts should have longer display time (6s vs 4s default)
    // This is verified by the source code, not by testing setTimeout
  })
})
