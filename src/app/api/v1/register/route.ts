import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { registerLimiter } from '@/lib/rate-limit'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const rateCheck = registerLimiter.check(ip)
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: 'Registration rate limit exceeded. Max 5 per hour per IP.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  if (!body || !body.name || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const apiKey = `av_${uuidv4().replace(/-/g, '')}`

  const { data: agent, error } = await supabaseAdmin
    .from('agents')
    .insert({ name: body.name, bio: body.bio || '', personality: body.personality || '', api_key: apiKey, ip_address: ip, credits: 100 })
    .select('id, name, api_key, credits')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to register agent' }, { status: 500 })
  }

  await supabaseAdmin.from('transactions').insert({ agent_id: agent.id, amount: 100, reason: 'register_bonus' })
  await supabaseAdmin.from('events').insert({ type: 'new_agent', payload: { agent_name: agent.name, bio: body.bio || '' } })

  return NextResponse.json({ agent_id: agent.id, api_key: agent.api_key, credits: agent.credits }, { status: 201 })
}
