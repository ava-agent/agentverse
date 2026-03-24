import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { authenticateAgent } from '@/lib/auth'
import { COSTS, validateCredits } from '@/lib/credits'

const VALID_TYPES = ['text', 'code', 'url', 'mixed'] as const
const MAX_POSTS_PER_SEASON = 3

export async function POST(req: NextRequest) {
  const auth = await authenticateAgent(req)
  if (auth.error) return auth.error

  const body = await req.json().catch(() => null)
  if (!body || !body.title || typeof body.title !== 'string') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }
  if (!body.type || !VALID_TYPES.includes(body.type)) {
    return NextResponse.json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 })
  }
  if (!body.content || typeof body.content !== 'object') {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }
  if (!body.season_id || typeof body.season_id !== 'string') {
    return NextResponse.json({ error: 'season_id is required' }, { status: 400 })
  }

  // Check season exists and is in creation phase
  const { data: season, error: seasonError } = await supabaseAdmin
    .from('seasons')
    .select('id, status')
    .eq('id', body.season_id)
    .single()

  if (seasonError || !season) {
    return NextResponse.json({ error: 'Season not found' }, { status: 404 })
  }
  if (season.status !== 'creation') {
    return NextResponse.json({ error: 'Season is not in creation phase' }, { status: 403 })
  }

  // Enforce 3 posts per season limit
  const { count, error: countError } = await supabaseAdmin
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('agent_id', auth.agent.id)
    .eq('season_id', body.season_id)

  if (countError) {
    return NextResponse.json({ error: 'Failed to check post limit' }, { status: 500 })
  }
  if ((count ?? 0) >= MAX_POSTS_PER_SEASON) {
    return NextResponse.json({ error: `Maximum ${MAX_POSTS_PER_SEASON} posts per season` }, { status: 403 })
  }

  // Check credits
  if (!validateCredits(auth.agent.credits, 'post')) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  // Debit credits
  const { data: debitOk, error: debitError } = await supabaseAdmin.rpc('debit_credits', {
    p_agent_id: auth.agent.id,
    p_amount: COSTS.post,
    p_reason: 'post_cost',
    p_reference_id: null,
  })
  if (debitError || !debitOk) {
    return NextResponse.json({ error: 'Failed to debit credits' }, { status: 500 })
  }

  // Create post
  const { data: post, error: postError } = await supabaseAdmin
    .from('posts')
    .insert({
      agent_id: auth.agent.id,
      season_id: body.season_id,
      title: body.title,
      type: body.type,
      content: body.content,
    })
    .select()
    .single()

  if (postError || !post) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }

  // Emit new_post event
  await supabaseAdmin.from('events').insert({
    type: 'new_post',
    payload: { post_id: post.id, agent_id: auth.agent.id, agent_name: auth.agent.name, title: post.title },
  })

  return NextResponse.json({ post }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const season_id = searchParams.get('season_id')
  const sort = searchParams.get('sort') ?? 'recent'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('posts')
    .select('*, agents(name)', { count: 'exact' })

  if (season_id) {
    query = query.eq('season_id', season_id)
  }

  if (sort === 'votes') {
    query = query.order('vote_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: posts, count, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }

  return NextResponse.json({ posts: posts ?? [], total: count ?? 0, page, limit })
}
