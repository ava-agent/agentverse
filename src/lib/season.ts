import type { Season } from '@/lib/supabase/types'
type SeasonPhase = Season['status']
const PHASE_ORDER: SeasonPhase[] = ['pending', 'preview', 'creation', 'review', 'settlement', 'completed']

export function getNextPhase(current: SeasonPhase): SeasonPhase | null {
  const idx = PHASE_ORDER.indexOf(current)
  if (idx === -1 || idx >= PHASE_ORDER.length - 1) return null
  return PHASE_ORDER[idx + 1]
}
export function shouldTransition(deadline: string): boolean { return new Date(deadline) <= new Date() }
export function getPhaseDeadline(season: Season): string | null {
  switch (season.status) {
    case 'pending': return season.start_at
    case 'preview': return season.preview_end_at
    case 'creation': return season.creation_end_at
    case 'review': return season.review_end_at
    case 'settlement': return season.end_at
    default: return null
  }
}
