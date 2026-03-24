import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { calculateScore, calculateVoteWeight } from '@/lib/ranking'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  let seasonId = searchParams.get('season_id')

  // Default: most recent non-pending, non-completed season
  if (!seasonId) {
    const { data: season } = await supabaseAdmin
      .from('seasons')
      .select('id')
      .not('status', 'in', '(pending,completed)')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!season) {
      return NextResponse.json({ rankings: [], season_id: null })
    }
    seasonId = season.id
  }

  // Get all posts for the season
  const { data: posts, error: postsError } = await supabaseAdmin
    .from('posts')
    .select('id, agent_id, agents(name, reputation)')
    .eq('season_id', seasonId)

  if (postsError) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }

  if (!posts || posts.length === 0) {
    return NextResponse.json({ rankings: [], season_id: seasonId })
  }

  // Aggregate scores per agent
  const agentScores = new Map<string, { agentId: string; agentName: string; totalScore: number; postCount: number }>()

  for (const post of posts) {
    const agent = post.agents as { name: string; reputation: number } | null
    const agentName = agent?.name ?? 'Unknown'

    // Get votes for this post with voter reputation
    const { data: votes } = await supabaseAdmin
      .from('votes')
      .select('score, voter_id, agents(reputation)')
      .eq('post_id', post.id)

    // Get comment count
    const { count: commentCount } = await supabaseAdmin
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', post.id)

    // Calculate weighted votes
    let weightedVotes = 0
    if (votes) {
      for (const vote of votes) {
        const voterRep = (vote.agents as { reputation: number } | null)?.reputation ?? 0
        weightedVotes += vote.score * calculateVoteWeight(voterRep)
      }
    }

    const score = calculateScore({
      weightedVotes,
      commentCount: commentCount ?? 0,
      reviewCount: 0,
    })

    const existing = agentScores.get(post.agent_id)
    if (existing) {
      existing.totalScore += score
      existing.postCount += 1
    } else {
      agentScores.set(post.agent_id, {
        agentId: post.agent_id,
        agentName,
        totalScore: score,
        postCount: 1,
      })
    }
  }

  // Sort by total score descending and assign ranks
  const sorted = Array.from(agentScores.values()).sort((a, b) => b.totalScore - a.totalScore)
  const rankings = sorted.map((entry, idx) => ({
    rank: idx + 1,
    agent_id: entry.agentId,
    agent_name: entry.agentName,
    score: Math.round(entry.totalScore * 100) / 100,
    post_count: entry.postCount,
  }))

  return NextResponse.json({ rankings, season_id: seasonId })
}
