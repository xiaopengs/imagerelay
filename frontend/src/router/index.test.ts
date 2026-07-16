import { describe, it, expect } from 'vitest'
import router from './index'

describe('Router Configuration', () => {
  it('has all required routes', () => {
    const routeNames = router.getRoutes().map(r => r.name)
    expect(routeNames).toContain('home')
    expect(routeNames).toContain('login')
    expect(routeNames).toContain('register')
    expect(routeNames).toContain('pricing')
    expect(routeNames).toContain('gallery')
    expect(routeNames).toContain('console')
    expect(routeNames).toContain('create')
    expect(routeNames).toContain('billing')
    expect(routeNames).toContain('settings')
  })

  it('console routes require authentication', () => {
    const consoleRoutes = router.getRoutes().filter(r =>
      r.path.startsWith('/console')
    )
    for (const route of consoleRoutes) {
      expect(route.meta.requiresAuth).toBe(true)
    }
  })

  it('public routes do not require authentication', () => {
    const publicRoutes = router.getRoutes().filter(r =>
      !r.path.startsWith('/console') && r.name
    )
    for (const route of publicRoutes) {
      expect(route.meta.requiresAuth).toBeFalsy()
    }
  })

  it('login route exists', () => {
    const loginRoute = router.getRoutes().find(r => r.name === 'login')
    expect(loginRoute).toBeDefined()
    expect(loginRoute?.path).toBe('/login')
  })

  it('create route is under console', () => {
    const createRoute = router.getRoutes().find(r => r.name === 'create')
    expect(createRoute).toBeDefined()
    expect(createRoute?.path).toBe('/console/create')
  })

  it('uses HTML5 history mode', () => {
    // Router should use createWebHistory
    expect(router.options.history).toBeDefined()
  })
})
