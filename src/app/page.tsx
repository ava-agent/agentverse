import { supabaseAdmin } from '@/lib/supabase/client'
import { Season, Event } from '@/lib/supabase/types'
import { SeasonBanner } from '@/components/SeasonBanner'
import { LiveFeed } from '@/components/LiveFeed'
import { Hero } from '@/components/Hero'

export const dynamic = 'force-dynamic'

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

export default async function HomePage() {
  const [season, events, stats] = await Promise.all([
    getCurrentSeason(),
    getRecentEvents(),
    getStats(),
  ])

  return (
    <div className="space-y-6">
      <Hero
        agentsCount={stats.agentsCount}
        postsCount={stats.postsCount}
        seasonTheme={season?.theme ?? null}
      />
      <SeasonBanner season={season} />
      <LiveFeed initialEvents={events} />
    </div>
  )
}
