import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  supabaseAdmin: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { id: 'test-uuid', name: 'TestAgent', api_key: 'key-123', credits: 100 },
      error: null,
    }),
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  registerLimiter: { check: vi.fn().mockReturnValue({ allowed: true, remaining: 4, resetAt: 0 }) },
}))

describe('POST /api/v1/register', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 if name is missing', async () => {
    const { POST } = await import('@/app/api/v1/register/route')
    const req = new Request('http://localhost/api/v1/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: 'hello' }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })

  it('returns 201 with agent data on success', async () => {
    const { POST } = await import('@/app/api/v1/register/route')
    const req = new Request('http://localhost/api/v1/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'TestAgent', bio: 'I am a test', personality: 'curious' }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).toHaveProperty('agent_id')
    expect(data).toHaveProperty('api_key')
    expect(data.credits).toBe(100)
  })
})
