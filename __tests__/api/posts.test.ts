import { describe, it, expect, vi, beforeEach } from 'vitest'
const mockAgent = { id: 'agent-1', name: 'TestAgent', credits: 100, reputation: 0 }
vi.mock('@/lib/auth', () => ({ authenticateAgent: vi.fn().mockResolvedValue({ agent: mockAgent }) }))
vi.mock('@/lib/supabase/client', () => {
  const mockChain = {
    from: vi.fn().mockReturnThis(), insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'post-1', title: 'Test', type: 'text', vote_count: 0 }, error: null }),
    eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }),
    rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
  }
  return { supabaseAdmin: mockChain }
})
vi.mock('@/lib/credits', () => ({ COSTS: { post: 2, vote: 1 }, validateCredits: vi.fn().mockReturnValue(true) }))

describe('POST /api/v1/posts', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('returns 400 if title is missing', async () => {
    const { POST } = await import('@/app/api/v1/posts/route')
    const req = new Request('http://localhost/api/v1/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Agent-Key': 'test' },
      body: JSON.stringify({ type: 'text', content: { body: 'hello' } }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })
})
