import { Season } from '@/lib/supabase/types'

const PHASES = ['preview', 'creation', 'review', 'settlement', 'completed'] as const

const PHASE_LABELS: Record<string, string> = {
  preview: 'Preview',
  creation: 'Creation',
  review: 'Review',
  settlement: 'Settlement',
  completed: 'Completed',
}

const PHASE_COLORS: Record<string, string> = {
  preview: 'bg-blue-500',
  creation: 'bg-emerald-500',
  review: 'bg-amber-500',
  settlement: 'bg-purple-500',
  completed: 'bg-gray-500',
}

const PHASE_BADGE: Record<string, string> = {
  preview: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  creation: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  settlement: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const PHASE_GUIDANCE: Record<string, { title: string; description: string; action: string }> = {
  preview: {
    title: 'Get Ready',
    description: 'Review the theme and prepare your ideas. Registration is open.',
    action: 'Register Now →',
  },
  creation: {
    title: 'Submit Your Work',
    description: 'Submit your projects! Costs 2 credits per submission (max 3).',
    action: 'View Feed →',
  },
  review: {
    title: 'Vote & Review',
    description: 'Vote on submissions (costs 1 credit, earns 2 if you vote early).',
    action: 'Start Voting →',
  },
  settlement: {
    title: 'Final Scoring',
    description: 'Scores are being calculated. Winners will be announced soon.',
    action: 'View Leaderboard →',
  },
  completed: {
    title: 'Season Complete',
    description: 'Check out the winners and start preparing for the next season!',
    action: 'View Results →',
  },
}

function getPhaseDeadline(season: Season): string | null {
  switch (season.status) {
    case 'preview': return season.preview_end_at
    case 'creation': return season.creation_end_at
    case 'review': return season.review_end_at
    case 'settlement': return season.end_at
    default: return null
  }
}

function formatTimeRemaining(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return 'Ending soon'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h remaining`
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  return `${minutes}m remaining`
}

export function SeasonBanner({ season }: { season: Season | null }) {
  if (!season) {
    return (
      <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-6 text-center text-gray-500">
        No active season — Check back soon for the next competition.
      </div>
    )
  }

  const currentIdx = PHASES.indexOf(season.status as typeof PHASES[number])
  const deadline = getPhaseDeadline(season)
  const guidance = PHASE_GUIDANCE[season.status]

  return (
    <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Season</p>
          <h2 className="text-lg font-semibold text-white">{season.theme}</h2>
        </div>
        <div className="flex items-center gap-3">
          {deadline && (
            <span className="text-xs text-gray-500">{formatTimeRemaining(deadline)}</span>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${PHASE_BADGE[season.status] || 'bg-gray-700 text-gray-300 border-gray-600'}`}>
            {PHASE_LABELS[season.status] || season.status}
          </span>
        </div>
      </div>

      {/* Phase progress bar */}
      <div className="flex items-center gap-1 mb-4">
        {PHASES.map((phase, idx) => (
          <div key={phase} className="flex-1 flex items-center gap-1">
            <div className="flex-1 relative">
              <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx <= currentIdx ? PHASE_COLORS[phase] : ''
                  }`}
                  style={{ width: idx <= currentIdx ? '100%' : '0%' }}
                />
              </div>
              <p className={`text-[10px] mt-1 text-center ${
                idx === currentIdx ? 'text-gray-300 font-medium' : 'text-gray-600'
              }`}>
                {PHASE_LABELS[phase]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Phase guidance */}
      {guidance && (
        <div className={`rounded-lg p-4 border ${PHASE_BADGE[season.status]} mt-4`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">{guidance.title}</h3>
              <p className="text-sm opacity-90">{guidance.description}</p>
            </div>
            <a
              href={season.status === 'creation' ? '/' : season.status === 'review' ? '/' : season.status === 'completed' || season.status === 'settlement' ? '/leaderboard' : '/quickstart'}
              className="shrink-0 text-sm font-medium hover:underline"
            >
              {guidance.action}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
