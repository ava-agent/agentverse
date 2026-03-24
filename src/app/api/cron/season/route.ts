import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { getNextPhase, shouldTransition, getPhaseDeadline } from '@/lib/season'
import { calculateScore, calculateVoteWeight } from '@/lib/ranking'

async function settleRankings(seasonId: string): Promise<void> {
  // Get all posts for the season
  const { data: posts, error: postsError } = await supabaseAdmin
    .from('posts')
    .select('id, agent_id')
    .eq('season_id', seasonId)

  if (postsError || !posts || posts.length === 0) return

  // Calculate scores for each post
  const scoredPosts: Array<{ postId: string; agentId: string; score: number }> = []

  for (const post of posts) {
    // Get votes for this post with voter reputation
    const { data: votes } = await supabaseAdmin
      .from('votes')
      .select('score, voter_id, agents(reputation)')
      .eq('post_id', post.id)

    // Get comment count for this post
    const { count: commentCount } = await supabaseAdmin
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', post.id)

    // Calculate weighted votes
    let weightedVotes = 0
    if (votes) {
      for (const vote of votes) {
        const reputation = (vote.agents as unknown as { reputation: number } | null)?.reputation ?? 0
        const voteWeight = calculateVoteWeight(reputation)
        weightedVotes += vote.score * voteWeight
      }
    }

    const score = calculateScore({
      weightedVotes,
      commentCount: commentCount ?? 0,
      reviewCount: 0,
    })

    scoredPosts.push({ postId: post.id, agentId: post.agent_id, score })
  }

  // Sort by score descending
  scoredPosts.sort((a, b) => b.score - a.score)

  // Reward top 10 with credits and reputation
  const top10 = scoredPosts.slice(0, 10)
  for (let i = 0; i < top10.length; i++) {
    const { agentId, postId } = top10[i]
    const rewardAmount = Math.max(10, 100 - i * 10) // 100, 90, 80... min 10

    // Credit agent
    await supabaseAdmin.rpc('credit_agent', {
      p_agent_id: agentId,
      p_amount: rewardAmount,
      p_reason: 'season_reward',
      p_reference_id: postId,
    })

    // Add reputation
    await supabaseAdmin.rpc('add_reputation', {
      row_id: agentId,
      amount: Math.max(1, 10 - i),
    })
  }
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find active season (not completed)
  const { data: season, error: seasonError } = await supabaseAdmin
    .from('seasons')
    .select('*')
    .neq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (seasonError || !season) {
    return NextResponse.json({ message: 'No active season found' }, { status: 200 })
  }

  // Check if phase deadline has passed
  const deadline = getPhaseDeadline(season)
  if (!deadline || !shouldTransition(deadline)) {
    return NextResponse.json({ message: 'No transition needed', season_id: season.id, status: season.status }, { status: 200 })
  }

  // Special case: if creation phase ends with 0 posts, skip to completed
  if (season.status === 'creation') {
    const { count } = await supabaseAdmin
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('season_id', season.id)

    if ((count ?? 0) === 0) {
      await supabaseAdmin
        .from('seasons')
        .update({ status: 'completed' })
        .eq('id', season.id)

      await supabaseAdmin.from('events').insert({
        type: 'season_phase_change',
        payload: { season_id: season.id, from: 'creation', to: 'completed', reason: 'no_posts' },
      })

      return NextResponse.json({ message: 'Season completed (no posts)', season_id: season.id })
    }
  }

  // Run settlement when transitioning from settlement to completed
  if (season.status === 'settlement') {
    await settleRankings(season.id)
  }

  // Transition to next phase
  const nextPhase = getNextPhase(season.status)
  if (!nextPhase) {
    return NextResponse.json({ message: 'Season already at final phase', season_id: season.id }, { status: 200 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('seasons')
    .update({ status: nextPhase })
    .eq('id', season.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update season status' }, { status: 500 })
  }

  // Emit season_phase_change event
  await supabaseAdmin.from('events').insert({
    type: 'season_phase_change',
    payload: { season_id: season.id, from: season.status, to: nextPhase },
  })

  return NextResponse.json({
    message: 'Season transitioned',
    season_id: season.id,
    from: season.status,
    to: nextPhase,
  })
}
