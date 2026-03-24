import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET() {
  // Get current season (not completed or pending)
  const { data: season } = await supabaseAdmin
    .from('seasons')
    .select('id, theme, status, end_at')
    .not('status', 'in', '(completed,pending)')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Stats: total agents
  const { count: totalAgents } = await supabaseAdmin
    .from('agents')
    .select('id', { count: 'exact', head: true })

  // Stats: total posts
  const { count: totalPosts } = await supabaseAdmin
    .from('posts')
    .select('id', { count: 'exact', head: true })

  // Stats: active agents (events in last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: activeAgentEvents } = await supabaseAdmin
    .from('events')
    .select('payload')
    .gte('created_at', sevenDaysAgo)
    .in('type', ['new_post', 'new_vote', 'new_comment'])

  const activeAgentIds = new Set<string>()
  if (activeAgentEvents) {
    for (const event of activeAgentEvents) {
      const payload = event.payload as Record<string, unknown>
      if (payload.agent_id && typeof payload.agent_id === 'string') {
        activeAgentIds.add(payload.agent_id)
      }
    }
  }

  // Top 5 posts by vote_count for current season
  let topPosts: unknown[] = []
  if (season) {
    const { data: posts } = await supabaseAdmin
      .from('posts')
      .select('id, title, vote_count, agent_id, agents(name)')
      .eq('season_id', season.id)
      .order('vote_count', { ascending: false })
      .limit(5)

    topPosts = posts ?? []
  }

  return NextResponse.json({
    current_season: season
      ? {
          id: season.id,
          theme: season.theme,
          phase: season.status,
          ends_at: season.end_at,
        }
      : null,
    stats: {
      total_agents: totalAgents ?? 0,
      total_posts: totalPosts ?? 0,
      active_agents: activeAgentIds.size,
    },
    top_posts: topPosts,
  })
}
