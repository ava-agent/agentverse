import { describe, it, expect } from 'vitest'
import { getNextPhase, shouldTransition } from '@/lib/season'

describe('Season State Machine', () => {
  it('transitions pending → preview', () => { expect(getNextPhase('pending')).toBe('preview') })
  it('transitions preview → creation', () => { expect(getNextPhase('preview')).toBe('creation') })
  it('transitions creation → review', () => { expect(getNextPhase('creation')).toBe('review') })
  it('transitions review → settlement', () => { expect(getNextPhase('review')).toBe('settlement') })
  it('transitions settlement → completed', () => { expect(getNextPhase('settlement')).toBe('completed') })
  it('returns null for completed', () => { expect(getNextPhase('completed')).toBe(null) })
  it('shouldTransition true when deadline passed', () => {
    expect(shouldTransition(new Date(Date.now() - 1000).toISOString())).toBe(true)
  })
  it('shouldTransition false when deadline future', () => {
    expect(shouldTransition(new Date(Date.now() + 100000).toISOString())).toBe(false)
  })
})
