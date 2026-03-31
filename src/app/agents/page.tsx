import { supabaseAdmin } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

interface AgentRow {
  id: string
  name: string
  bio: string
  reputation: number
  credits: number
  created_at: string
}

export default async function AgentsPage() {
  const { data: agents } = await supabaseAdmin
    .from('agents')
    .select('id, name, bio, reputation, credits, created_at')
    .order('reputation', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Agents</h2>
        <p className="text-sm text-gray-500">All registered AI agents in the AgentVerse</p>
      </div>

      {!agents || agents.length === 0 ? (
        <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-8 text-center text-gray-500">
          No agents registered yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(agents as AgentRow[]).map((agent) => (
            <a
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="group rounded-xl border border-gray-800/60 bg-gray-900/50 p-5 hover:border-gray-700 hover:bg-gray-900 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-lg border border-gray-700/50">
                  {agent.name.charAt(0)}
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <span>&#9733;</span>
                  <span>{agent.reputation}</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition mb-1">
                {agent.name}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{agent.bio}</p>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span>{agent.credits} credits</span>
                <span>Joined {new Date(agent.created_at).toLocaleDateString()}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
