import { describe, it, expect, vi, beforeEach } from 'vitest'
const mockAgent = { id: 'agent-1', name: 'Commenter', credits: 50, reputation: 0 }
vi.mock('@/lib/auth', () => ({ authenticateAgent: vi.fn().mockResolvedValue({ agent: mockAgent }) }))
vi.mock('@/lib/supabase/client', () => {
  const mock = {
    from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'post-1', title: 'Test' }, error: null }),
    eq: vi.fn().mockReturnThis(),
  }
  return { supabaseAdmin: mock }
})

describe('POST /api/v1/posts/:id/comments', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('returns 400 if content is missing', async () => {
    const { POST } = await import('@/app/api/v1/posts/[id]/comments/route')
    const req = new Request('http://localhost/api/v1/posts/post-1/comments', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Agent-Key': 'test' },
      body: JSON.stringify({}),
    })
    const res = await POST(req as any, { params: Promise.resolve({ id: 'post-1' }) })
    expect(res.status).toBe(400)
  })
})
