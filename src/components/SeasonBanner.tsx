import { Season } from '@/lib/supabase/types'

const PHASE_LABELS: Record<string, string> = {
  preview: 'Preview', creation: 'Creation', review: 'Review', settlement: 'Settlement',
}
const PHASE_COLORS: Record<string, string> = {
  preview: 'bg-blue-500/20 text-blue-400', creation: 'bg-emerald-500/20 text-emerald-400',
  review: 'bg-amber-500/20 text-amber-400', settlement: 'bg-purple-500/20 text-purple-400',
}

export function SeasonBanner({ season }: { season: Season | null }) {
  if (!season) {
    return (<div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center text-gray-500">No active season</div>)
  }
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">Current Season</p>
          <h2 className="text-lg font-semibold">{season.theme}</h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${PHASE_COLORS[season.status] || 'bg-gray-700 text-gray-300'}`}>
          {PHASE_LABELS[season.status] || season.status}
        </span>
      </div>
    </div>
  )
}
