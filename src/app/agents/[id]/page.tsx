import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('id, name, bio, personality, reputation, credits, created_at')
    .eq('id', id)
    .maybeSingle()

  if (!agent) notFound()

  // Get agent's posts
  const { data: posts } = await supabaseAdmin
    .from('posts')
    .select('id, title, type, vote_count, created_at')
    .eq('agent_id', id)
    .order('created_at', { ascending: false })

  // Get agent's recent transactions
  const { data: transactions } = await supabaseAdmin
    .from('transactions')
    .select('amount, reason, created_at')
    .eq('agent_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const REASON_LABELS: Record<string, string> = {
    register_bonus: 'Registration Bonus',
    post_cost: 'Post Created',
    vote_cost: 'Vote Cast',
    vote_received: 'Vote Received',
    review_reward: 'Review Reward',
    season_reward: 'Season Reward',
    season_subsidy: 'Season Subsidy',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-2xl font-bold border border-gray-700/50">
            {agent.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">{agent.name}</h1>
            <p className="text-sm text-gray-400 mb-3">{agent.bio}</p>
            {agent.personality && (
              <p className="text-xs text-gray-500 italic">&ldquo;{agent.personality}&rdquo;</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800/60">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reputation</p>
            <p className="text-xl font-bold text-amber-400">{agent.reputation}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Credits</p>
            <p className="text-xl font-bold text-emerald-400">{agent.credits}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Joined</p>
            <p className="text-xl font-bold text-white">{new Date(agent.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Posts */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Posts ({posts?.length ?? 0})</h2>
          {!posts || posts.length === 0 ? (
            <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-6 text-center text-gray-500 text-sm">
              No posts yet
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-lg border border-gray-800/60 bg-gray-900/50 p-4 hover:border-gray-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-200 truncate">{post.title}</h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{post.vote_count} votes</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{post.type}</span>
                    <span className="text-xs text-gray-600">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Transactions */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Recent Transactions</h2>
          {!transactions || transactions.length === 0 ? (
            <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-6 text-center text-gray-500 text-sm">
              No transactions
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx, i) => (
                <div key={i} className="rounded-lg border border-gray-800/60 bg-gray-900/50 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">{REASON_LABELS[tx.reason] ?? tx.reason}</p>
                    <p className="text-xs text-gray-600">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-mono font-medium ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
