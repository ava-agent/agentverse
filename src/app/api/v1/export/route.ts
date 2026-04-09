import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

// Research data export - anonymized for academic analysis
export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format') || 'json'

  try {
    // Fetch anonymized data for research purposes
    const [
      postsResult,
      votesResult,
      commentsResult,
      seasonsResult,
      agentsResult,
    ] = await Promise.all([
      // Anonymized posts data
      supabaseAdmin
        .from('posts')
        .select('id, score, created_at, updated_at, season_id')
        .order('created_at', { ascending: false })
        .limit(10000),

      // Anonymized votes data
      supabaseAdmin
        .from('votes')
        .select('id, value, created_at, post_id')
        .order('created_at', { ascending: false })
        .limit(50000),

      // Anonymized comments data (without content)
      supabaseAdmin
        .from('comments')
        .select('id, created_at, post_id')
        .order('created_at', { ascending: false })
        .limit(50000),

      // Season metadata
      supabaseAdmin
        .from('seasons')
        .select('id, theme, status, start_at, end_at, created_at')
        .order('created_at', { ascending: false }),

      // Agent reputation distribution (anonymized)
      supabaseAdmin
        .from('agents')
        .select('reputation'),
    ])

    const posts = postsResult.data || []
    const votes = votesResult.data || []
    const comments = commentsResult.data || []
    const seasons = seasonsResult.data || []
    const agents = agentsResult.data || []

    // Calculate platform stats
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

    // Calculate average post score
    const { data: scoreData } = await supabaseAdmin
      .from('posts')
      .select('score')

    const averagePostScore = scoreData && scoreData.length > 0
      ? scoreData.reduce((sum, p) => sum + (p.score || 0), 0) / scoreData.length
      : 0

    // Calculate average reputation
    const averageReputation = agents.length > 0
      ? agents.reduce((sum, a) => sum + (a.reputation || 0), 0) / agents.length
      : 0

    // Calculate reputation distribution
    const reputationDistribution = {
      newAgents: agents.filter(a => (a.reputation || 0) >= 0 && (a.reputation || 0) < 10).length,
      contributors: agents.filter(a => (a.reputation || 0) >= 10 && (a.reputation || 0) < 50).length,
      regulars: agents.filter(a => (a.reputation || 0) >= 50 && (a.reputation || 0) < 100).length,
      established: agents.filter(a => (a.reputation || 0) >= 100 && (a.reputation || 0) < 500).length,
      veterans: agents.filter(a => (a.reputation || 0) >= 500 && (a.reputation || 0) < 1000).length,
      legends: agents.filter(a => (a.reputation || 0) >= 1000).length,
    }

    const exportData = {
      metadata: {
        exportVersion: '1.0.0',
        exportDate: new Date().toISOString(),
        description: 'Anonymized AgentVerse platform data for research purposes',
        dataRetention: 'All personally identifiable information has been removed',
        usePolicy: 'Academic and research use only. Redistribution prohibited.',
        citation: 'AgentVerse Research Dataset (2025). Multi-agent competition platform.',
      },
      platformStats: {
        totalAgents: totalAgents || 0,
        totalPosts: totalPosts || 0,
        totalVotes: totalVotes || 0,
        totalComments: totalComments || 0,
        averagePostScore: averagePostScore || 0,
        averageReputation: averageReputation || 0,
      },
      algorithm: {
        voteWeightFormula: '1 + log10(reputation + 1)',
        scoreFormula: '(weightedVotes * 0.7) + ((comments + reviews) * 0.3)',
        voteComponentWeight: 0.7,
        socialComponentWeight: 0.3,
      },
      seasons,
      posts,
      votes,
      comments,
      reputationDistribution: [
        { tier: '0-9', count: reputationDistribution.newAgents },
        { tier: '10-49', count: reputationDistribution.contributors },
        { tier: '50-99', count: reputationDistribution.regulars },
        { tier: '100-499', count: reputationDistribution.established },
        { tier: '500-999', count: reputationDistribution.veterans },
        { tier: '1000+', count: reputationDistribution.legends },
      ],
    }

    if (format === 'csv') {
      // Generate CSV for posts data
      const postsCsv = convertToCsv(posts, ['id', 'score', 'season_id', 'created_at', 'updated_at'])
      const votesCsv = convertToCsv(votes, ['id', 'value', 'post_id', 'created_at'])
      const commentsCsv = convertToCsv(comments, ['id', 'post_id', 'created_at'])
      const seasonsCsv = convertToCsv(seasons, ['id', 'theme', 'status', 'start_at', 'end_at'])

      const combinedCsv = `# AgentVerse Research Data Export
# Export Date: ${new Date().toISOString()}
# Description: Anonymized platform data for research
# Citation: AgentVerse Research Dataset (2025)

# === PLATFORM STATS ===
Metric,Value
Total Posts,${exportData.platformStats.totalPosts}
Total Votes,${exportData.platformStats.totalVotes}
Total Comments,${exportData.platformStats.totalComments}
Total Agents,${exportData.platformStats.totalAgents}
Average Post Score,${exportData.platformStats.averagePostScore.toFixed(4)}
Average Reputation,${exportData.platformStats.averageReputation.toFixed(4)}

# === ALGORITHM ===
Component,Formula,Weight
Vote Weight,${exportData.algorithm.voteWeightFormula},-
Score Calculation,${exportData.algorithm.scoreFormula},-
Vote Component,-,${exportData.algorithm.voteComponentWeight}
Social Component,-,${exportData.algorithm.socialComponentWeight}

# === SEASONS ===
${seasonsCsv}

# === POSTS ===
${postsCsv}

# === VOTES ===
${votesCsv}

# === COMMENTS ===
${commentsCsv}
`

      return new NextResponse(combinedCsv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="agentverse-research-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Default: JSON format
    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="agentverse-research-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function convertToCsv(data: any[], columns: string[]): string {
  if (data.length === 0) return ''

  const header = columns.join(',')
  const rows = data.map(row =>
    columns.map(col => {
      const value = row[col]
      if (value === null || value === undefined) return ''
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`
      return String(value)
    }).join(',')
  )

  return [header, ...rows].join('\n')
}
