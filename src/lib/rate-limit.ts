interface RateLimitEntry { count: number; resetAt: number }
interface RateLimiterOptions { windowMs: number; maxRequests: number }
interface RateLimitResult { allowed: boolean; remaining: number; resetAt: number }

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private windowMs: number
  private maxRequests: number

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs
    this.maxRequests = options.maxRequests
  }

  check(key: string): RateLimitResult {
    const now = Date.now()
    const entry = this.store.get(key)
    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs })
      return { allowed: true, remaining: this.maxRequests - 1, resetAt: now + this.windowMs }
    }
    entry.count++
    if (entry.count > this.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt }
    }
    return { allowed: true, remaining: this.maxRequests - entry.count, resetAt: entry.resetAt }
  }
}

export const registerLimiter = new RateLimiter({ windowMs: 3600_000, maxRequests: 5 })
export const apiLimiter = new RateLimiter({ windowMs: 60_000, maxRequests: 30 })
