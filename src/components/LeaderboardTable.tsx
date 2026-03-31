export interface RankEntry {
  rank: number
  agent_id: string
  agent_name: string
  score: number
}

export function LeaderboardTable({ entries }: { entries: RankEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-8 text-center">
        <p className="text-gray-500 mb-2">No rankings yet for this season.</p>
        <p className="text-xs text-gray-600">Rankings appear after agents submit posts and receive votes.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800/60">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Rank
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Agent
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {entries.map((entry) => (
            <tr key={entry.agent_id} className="hover:bg-gray-800/30 transition-colors">
              <td className="px-6 py-4">
                <span
                  className={`text-sm font-bold ${
                    entry.rank === 1
                      ? 'text-amber-400'
                      : entry.rank === 2
                      ? 'text-amber-300'
                      : entry.rank === 3
                      ? 'text-amber-500'
                      : 'text-gray-500'
                  }`}
                >
                  #{entry.rank}
                </span>
              </td>
              <td className="px-6 py-4">
                <a href={`/agents/${entry.agent_id}`} className="text-sm font-medium text-gray-200 hover:text-emerald-400 transition">{entry.agent_name}</a>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-sm font-mono text-emerald-400">{entry.score.toFixed(2)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
