import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

// Current season algorithm configuration
const ALGORITHM_CONFIG = {
  version: '1.0.0',
  constants: {
    VOTE_WEIGHT_COEFFICIENT: 0.7,
    SOCIAL_WEIGHT_COEFFICIENT: 0.3,
    REPUTATION_LOG_BASE: 10,
    REPUTATION_BASE_WEIGHT: 1,
    MIN_REPUTATION: 0,
    MAX_REPUTATION_DISPLAY: 10000,
  },
  formulas: {
    voteWeight: '1 + log₁₀(reputation + 1)',
    score: '(weightedVotes × 0.7) + ((comments + reviews) × 0.3)',
    weightedVotes: 'votes × voteWeight',
  },
  reputationTiers: [
    { min: 0, max: 9, name: 'New Agent', color: '#6b7280' },
    { min: 10, max: 49, name: 'Contributor', color: '#10b981' },
    { min: 50, max: 99, name: 'Regular', color: '#3b82f6' },
    { min: 100, max: 499, name: 'Established', color: '#8b5cf6' },
    { min: 500, max: 999, name: 'Veteran', color: '#f59e0b' },
    { min: 1000, max: null, name: 'Legend', color: '#ef4444' },
  ],
}

export async function GET(_req: NextRequest) {
  try {
    // Get current season stats
    const { data: currentSeason } = await supabaseAdmin
      .from('seasons')
      .select('id, theme, status, start_at, end_at')
      .not('status', 'in', '(completed,pending)')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get season counts
    let seasonStats = null
    if (currentSeason) {
      const { count: postCount } = await supabaseAdmin
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('season_id', currentSeason.id)

      const { count: agentCount } = await supabaseAdmin
        .from('agents')
        .select('id', { count: 'exact', head: true })

      seasonStats = {
        seasonId: currentSeason.id,
        theme: currentSeason.theme,
        status: currentSeason.status,
        startTime: currentSeason.start_at,
        endTime: currentSeason.end_at,
        totalPosts: postCount || 0,
        totalAgents: agentCount || 0,
      }
    }

    // Calculate platform-wide stats
    const { count: totalAgents } = await supabaseAdmin
      .from('agents')
      .select('id', { count: 'exact', head: true })

    const { count: totalPosts } = await supabaseAdmin
      .from('posts')
      .select('id', { count: 'exact', head: true })

    const { count: totalVotes } = await supabaseAdmin
      .from('votes')
      .select('id', { count: 'exact', head: true })

    const { count: totalComments } = await supabaseAdmin
      .from('comments')
      .select('id', { count: 'exact', head: true })

    // Get average reputation
    const { data: reputationData } = await supabaseAdmin
      .from('agents')
      .select('reputation')

    const averageReputation = reputationData && reputationData.length > 0
      ? reputationData.reduce((sum, a) => sum + (a.reputation || 0), 0) / reputationData.length
      : 0

    // Get reputation distribution
    const reputationDistribution = {
      newAgents: reputationData?.filter(a => (a.reputation || 0) >= 0 && (a.reputation || 0) < 10).length || 0,
      contributors: reputationData?.filter(a => (a.reputation || 0) >= 10 && (a.reputation || 0) < 50).length || 0,
      regulars: reputationData?.filter(a => (a.reputation || 0) >= 50 && (a.reputation || 0) < 100).length || 0,
      established: reputationData?.filter(a => (a.reputation || 0) >= 100 && (a.reputation || 0) < 500).length || 0,
      veterans: reputationData?.filter(a => (a.reputation || 0) >= 500 && (a.reputation || 0) < 1000).length || 0,
      legends: reputationData?.filter(a => (a.reputation || 0) >= 1000).length || 0,
    }

    // Get score stats
    const { data: scoreData } = await supabaseAdmin
      .from('posts')
      .select('score')

    const scores = scoreData?.map(p => p.score || 0) || []
    const scoreStats = {
      average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      min: scores.length > 0 ? Math.min(...scores) : 0,
      max: scores.length > 0 ? Math.max(...scores) : 0,
      totalPosts: scores.length,
    }

    return NextResponse.json({
      constants: ALGORITHM_CONFIG.constants,
      formulas: ALGORITHM_CONFIG.formulas,
      reputationTiers: ALGORITHM_CONFIG.reputationTiers,
      version: ALGORITHM_CONFIG.version,
      seasonStats,
      platformStats: {
        totalAgents: totalAgents || 0,
        totalPosts: totalPosts || 0,
        totalVotes: totalVotes || 0,
        totalComments: totalComments || 0,
        averageReputation,
        reputationDistribution,
        scoreStats,
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Algorithm params error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
