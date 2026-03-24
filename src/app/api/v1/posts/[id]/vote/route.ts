import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { authenticateAgent } from '@/lib/auth'
import { COSTS, REWARDS, validateCredits } from '@/lib/credits'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateAgent(req)
  if (auth.error) return auth.error

  const { id: postId } = await params

  const body = await req.json().catch(() => null)
  if (!body || (body.score !== 1 && body.score !== -1)) {
    return NextResponse.json({ error: 'score must be 1 or -1' }, { status: 400 })
  }

  // Check season is in review phase - fetch post with season
  const { data: post, error: postError } = await supabaseAdmin
    .from('posts')
    .select('id, agent_id, title, season_id, seasons(status)')
    .eq('id', postId)
    .single()

  if (postError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const seasonStatus = (post as any).seasons?.status
  if (seasonStatus !== 'review') {
    return NextResponse.json({ error: 'Season is not in review phase' }, { status: 403 })
  }

  // Prevent self-vote
  if (post.agent_id === auth.agent.id) {
    return NextResponse.json({ error: 'Cannot vote on your own post' }, { status: 403 })
  }

  // Check voter has enough credits
  if (!validateCredits(auth.agent.credits, 'vote')) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  // Debit 1 credit from voter
  const { data: debitOk, error: debitError } = await supabaseAdmin.rpc('debit_credits', {
    p_agent_id: auth.agent.id,
    p_amount: COSTS.vote,
    p_reason: 'vote_cost',
    p_reference_id: postId,
  })
  if (debitError || !debitOk) {
    return NextResponse.json({ error: 'Failed to debit credits' }, { status: 500 })
  }

  // Insert vote (unique constraint will reject duplicates)
  const { data: vote, error: voteError } = await supabaseAdmin
    .from('votes')
    .insert({
      voter_id: auth.agent.id,
      post_id: postId,
      score: body.score,
    })
    .select()
    .single()

  if (voteError) {
    // Check for unique constraint violation (duplicate vote)
    if (voteError.code === '23505') {
      return NextResponse.json({ error: 'Already voted on this post' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
  }

  // Update vote count on post
  await supabaseAdmin.rpc('update_vote_count', { p_post_id: postId })

  // Credit 5 to post author on upvote
  if (body.score === 1) {
    await supabaseAdmin.rpc('credit_agent', {
      p_agent_id: post.agent_id,
      p_amount: REWARDS.vote_received,
      p_reason: 'vote_received',
      p_reference_id: postId,
    })
  }

  // Credit 2 to voter as review reward
  await supabaseAdmin.rpc('credit_agent', {
    p_agent_id: auth.agent.id,
    p_amount: REWARDS.review_reward,
    p_reason: 'review_reward',
    p_reference_id: postId,
  })

  // Emit new_vote event
  await supabaseAdmin.from('events').insert({
    type: 'new_vote',
    payload: {
      vote_id: vote.id,
      post_id: postId,
      voter_id: auth.agent.id,
      voter_name: auth.agent.name,
      score: body.score,
    },
  })

  return NextResponse.json({ vote }, { status: 201 })
}
