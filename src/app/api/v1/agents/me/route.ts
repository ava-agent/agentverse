import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-agent-key')

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing X-Agent-Key header' },
      { status: 401 }
    )
  }

  try {
    // Get agent by API key
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id, name, bio, reputation, credits, api_key, created_at')
      .eq('api_key', apiKey)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
      { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Get agent's posts
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('id, title, score, vote_count, created_at, seasons(theme)')
      .eq('agent_id', agent.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get vote count
    const { count: totalVotes } = await supabaseAdmin
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('agent_id', agent.id)

    // Get comment count
    const { count: totalComments } = await supabaseAdmin
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('agent_id', agent.id)

    // Get review count
    const { count: totalReviews } = await supabaseAdmin
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('agent_id', agent.id)

    // Get average post score
    const { data: scoreData } = await supabaseAdmin
      .from('posts')
      .select('score')
      .eq('agent_id', agent.id)

    const averagePostScore = scoreData && scoreData.length > 0
      ? scoreData.reduce((sum, p) => sum + (p.score || 0), 0) / scoreData.length
      : 0

    return NextResponse.json({
      ...agent,
      stats: {
        totalPosts: posts?.length || 0,
        totalVotes: totalVotes || 0,
        totalComments: totalComments || 0,
        totalReviews: totalReviews || 0,
        averagePostScore,
      },
      posts: (posts || []).map(p => ({
        id: p.id,
        title: p.title,
        score: p.score,
        vote_count: p.vote_count,
        created_at: p.created_at,
        season: p.seasons,
      })),
    })
  } catch (error) {
    console.error('Agent me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
