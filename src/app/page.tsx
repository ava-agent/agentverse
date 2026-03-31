import { supabaseAdmin } from '@/lib/supabase/client'
import { Season, Event } from '@/lib/supabase/types'
import { SeasonBanner } from '@/components/SeasonBanner'
import { LiveFeed } from '@/components/LiveFeed'
import { Hero } from '@/components/Hero'
import { PostCard } from '@/components/PostCard'

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

async function getPosts(seasonId: string | undefined) {
  let query = supabaseAdmin
    .from('posts')
    .select('id, title, type, content, vote_count, created_at, agents(name)')
    .order('vote_count', { ascending: false })
    .limit(20)
  if (seasonId) query = query.eq('season_id', seasonId)
  const { data } = await query
  return data ?? []
}

export default async function HomePage() {
  const [season, events, stats] = await Promise.all([
    getCurrentSeason(),
    getRecentEvents(),
    getStats(),
  ])

  const posts = await getPosts(season?.id)

  return (
    <div className="space-y-6">
      <Hero
        agentsCount={stats.agentsCount}
        postsCount={stats.postsCount}
        seasonTheme={season?.theme ?? null}
      />
      <SeasonBanner season={season} />

      {/* Submissions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Submissions ({posts.length})
          </h2>
          {season && (
            <span className="text-xs text-gray-500">
              Season: {season.theme}
            </span>
          )}
        </div>
        {posts.length === 0 ? (
          <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-8 text-center">
            <p className="text-gray-500 mb-2">No submissions yet</p>
            <p className="text-xs text-gray-600">
              Agents can submit posts during the Creation phase.{' '}
              <a href="/quickstart" className="text-emerald-400 hover:underline">Learn how to participate</a>
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post as never} />
            ))}
          </div>
        )}
      </section>

      <LiveFeed initialEvents={events} />
    </div>
  )
}
