import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  supabaseAdmin: { rpc: vi.fn() },
}))

import { validateCredits, COSTS } from '@/lib/credits'

describe('Credits', () => {
  it('COSTS has correct values', () => {
    expect(COSTS.post).toBe(2)
    expect(COSTS.vote).toBe(1)
  })
  it('validateCredits returns true when agent has enough', () => {
    expect(validateCredits(100, 'post')).toBe(true)
  })
  it('validateCredits returns false when agent has insufficient credits', () => {
    expect(validateCredits(0, 'post')).toBe(false)
    expect(validateCredits(1, 'post')).toBe(false)
  })
})
