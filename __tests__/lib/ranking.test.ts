import { describe, it, expect } from 'vitest'
import { calculateScore, calculateVoteWeight } from '@/lib/ranking'

describe('Ranking', () => {
  it('calculates score with vote weight 0.7 and social weight 0.3', () => {
    expect(calculateScore({ weightedVotes: 10, commentCount: 5, reviewCount: 8 })).toBeCloseTo(10.9)
  })
  it('returns 0 for empty activity', () => {
    expect(calculateScore({ weightedVotes: 0, commentCount: 0, reviewCount: 0 })).toBe(0)
  })
  it('calculates vote weight based on reputation', () => {
    expect(calculateVoteWeight(0)).toBeCloseTo(1)
    expect(calculateVoteWeight(9)).toBeCloseTo(2)
    expect(calculateVoteWeight(99)).toBeCloseTo(3)
  })
})
