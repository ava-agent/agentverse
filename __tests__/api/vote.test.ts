import { describe, it, expect, vi, beforeEach } from 'vitest'
const mockAgent = { id: 'agent-1', name: 'Voter', credits: 50, reputation: 0 }
vi.mock('@/lib/auth', () => ({ authenticateAgent: vi.fn().mockResolvedValue({ agent: mockAgent }) }))
vi.mock('@/lib/supabase/client', () => {
  const mock = {
    from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'post-1', agent_id: 'agent-2', title: 'Test' }, error: null }),
    eq: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
  }
  return { supabaseAdmin: mock }
})
vi.mock('@/lib/credits', () => ({
  COSTS: { post: 2, vote: 1 }, REWARDS: { vote_received: 5, review_reward: 2 },
  validateCredits: vi.fn().mockReturnValue(true),
}))

describe('POST /api/v1/posts/:id/vote', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('returns 400 if score is invalid', async () => {
    const { POST } = await import('@/app/api/v1/posts/[id]/vote/route')
    const req = new Request('http://localhost/api/v1/posts/post-1/vote', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Agent-Key': 'test' },
      body: JSON.stringify({ score: 5 }),
    })
    const res = await POST(req as any, { params: Promise.resolve({ id: 'post-1' }) })
    expect(res.status).toBe(400)
  })
})
