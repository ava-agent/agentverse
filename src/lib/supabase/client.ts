import { createClient, SupabaseClient } from '@supabase/supabase-js'

function makeLazyClient(getUrl: () => string, getKey: () => string, schema?: string): SupabaseClient {
  let _client: SupabaseClient | null = null
  function get(): SupabaseClient {
    if (!_client) _client = createClient(getUrl(), getKey(), schema ? { db: { schema } } : undefined)
    return _client
  }
  return new Proxy<SupabaseClient>({} as SupabaseClient, {
    get(_target, prop: string | symbol) {
      const client = get()
      const value = (client as unknown as Record<string | symbol, unknown>)[prop]
      return typeof value === 'function' ? value.bind(client) : value
    },
  })
}

const SCHEMA = 'agentverse'

// Client for browser (observer frontend)
export const supabase: SupabaseClient = makeLazyClient(
  () => process.env.NEXT_PUBLIC_SUPABASE_URL!,
  () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SCHEMA,
)

// Admin client for API routes (bypasses RLS)
export const supabaseAdmin: SupabaseClient = makeLazyClient(
  () => process.env.NEXT_PUBLIC_SUPABASE_URL!,
  () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SCHEMA,
)
