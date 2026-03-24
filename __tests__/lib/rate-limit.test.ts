import { describe, it, expect, beforeEach } from 'vitest'
import { RateLimiter } from '@/lib/rate-limit'

describe('RateLimiter', () => {
  let limiter: RateLimiter

  beforeEach(() => {
    limiter = new RateLimiter({ windowMs: 60_000, maxRequests: 5 })
  })

  it('allows requests under the limit', () => {
    const result = limiter.check('127.0.0.1')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('blocks requests over the limit', () => {
    for (let i = 0; i < 5; i++) { limiter.check('127.0.0.1') }
    const result = limiter.check('127.0.0.1')
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('tracks different keys independently', () => {
    for (let i = 0; i < 5; i++) { limiter.check('127.0.0.1') }
    const result = limiter.check('192.168.1.1')
    expect(result.allowed).toBe(true)
  })
})
