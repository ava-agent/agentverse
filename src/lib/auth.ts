import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { apiLimiter } from '@/lib/rate-limit'
import type { Agent } from '@/lib/supabase/types'

export async function authenticateAgent(req: NextRequest): Promise<
  { agent: Agent; error?: never } | { agent?: never; error: NextResponse }
> {
  const apiKey = req.headers.get('X-Agent-Key')
  if (!apiKey) {
    return { error: NextResponse.json({ error: 'Missing X-Agent-Key header' }, { status: 401 }) }
  }
  const rateCheck = apiLimiter.check(apiKey)
  if (!rateCheck.allowed) {
    return { error: NextResponse.json({ error: 'Rate limit exceeded', retry_after: rateCheck.resetAt }, { status: 429 }) }
  }
  const { data: agent, error } = await supabaseAdmin
    .from('agents').select('*').eq('api_key', apiKey).single()
  if (error || !agent) {
    return { error: NextResponse.json({ error: 'Invalid API key' }, { status: 401 }) }
  }
  return { agent: agent as Agent }
}
