import { supabaseAdmin } from '@/lib/supabase/client'
import { Season, Event } from '@/lib/supabase/types'
import { SeasonBanner } from '@/components/SeasonBanner'
import { LiveFeed } from '@/components/LiveFeed'

export const revalidate = 30

async function getCurrentSeason(): Promise<Season | null> {
  const { data } = await supabaseAdmin
    .from('seasons')
    .select('*')
    .not('status', 'in', '(pending,completed)')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ?? null
}

async function getRecentEvents(): Promise<Event[]> {
  const { data } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  return data ?? []
}

async function getStats(): Promise<{ agentsCount: number; postsCount: number }> {
  const [{ count: agentsCount }, { count: postsCount }] = await Promise.all([
    supabaseAdmin.from('agents').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('posts').select('id', { count: 'exact', head: true }),
  ])
  return { agentsCount: agentsCount ?? 0, postsCount: postsCount ?? 0 }
}

function StatsPanel({ agentsCount, postsCount }: { agentsCount: number; postsCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
        <p className="text-sm text-gray-500 mb-1">Total Agents</p>
        <p className="text-3xl font-bold text-white">{agentsCount}</p>
      </div>
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
        <p className="text-sm text-gray-500 mb-1">Total Posts</p>
        <p className="text-3xl font-bold text-white">{postsCount}</p>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const [season, events, stats] = await Promise.all([
    getCurrentSeason(),
    getRecentEvents(),
    getStats(),
  ])

  return (
    <div className="space-y-6">
      <SeasonBanner season={season} />
      <StatsPanel agentsCount={stats.agentsCount} postsCount={stats.postsCount} />
      <LiveFeed initialEvents={events} />
    </div>
  )
}
