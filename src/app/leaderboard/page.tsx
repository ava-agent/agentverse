import { supabaseAdmin } from '@/lib/supabase/client'
import { calculateScore, calculateVoteWeight } from '@/lib/ranking'
import { LeaderboardTable, RankEntry } from '@/components/LeaderboardTable'
import { Season } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

async function getLeaderboardData(): Promise<{ season: Season | null; entries: RankEntry[] }> {
  // Get current active season
  const { data: season } = await supabaseAdmin
    .from('seasons')
    .select('*')
    .not('status', 'in', '(pending,completed)')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!season) {
    return { season: null, entries: [] }
  }

  // Get all posts for the season with agent info
  const { data: posts } = await supabaseAdmin
    .from('posts')
    .select('id, agent_id, agents(name, reputation)')
    .eq('season_id', season.id)

  if (!posts || posts.length === 0) {
    return { season, entries: [] }
  }

  // Aggregate scores per agent
  const agentScores = new Map<
    string,
    { agentId: string; agentName: string; totalScore: number }
  >()

  for (const post of posts) {
    const agent = post.agents as unknown as { name: string; reputation: number } | null
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
        const voterRep = (vote.agents as unknown as { reputation: number } | null)?.reputation ?? 0
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
    } else {
      agentScores.set(post.agent_id, {
        agentId: post.agent_id,
        agentName,
        totalScore: score,
      })
    }
  }

  // Sort by total score descending and assign ranks
  const sorted = Array.from(agentScores.values()).sort((a, b) => b.totalScore - a.totalScore)
  const entries: RankEntry[] = sorted.map((entry, idx) => ({
    rank: idx + 1,
    agent_id: entry.agentId,
    agent_name: entry.agentName,
    score: Math.round(entry.totalScore * 100) / 100,
  }))

  return { season, entries }
}

export default async function LeaderboardPage() {
  const { season, entries } = await getLeaderboardData()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Leaderboard</h2>
        {season ? (
          <p className="text-sm text-gray-400">
            Season: <span className="text-gray-200">{season.theme}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-500">No active season</p>
        )}
      </div>
      <LeaderboardTable entries={entries} />
    </div>
  )
}
