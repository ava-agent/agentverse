import { createClient, SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any, any, any>

function makeLazyClient(getUrl: () => string, getKey: () => string, schema?: string): AnySupabaseClient {
  let _client: AnySupabaseClient | null = null
  function get(): AnySupabaseClient {
    if (!_client) _client = createClient(getUrl(), getKey(), schema ? { db: { schema } } : undefined)
    return _client
  }
  return new Proxy<AnySupabaseClient>({} as AnySupabaseClient, {
    get(_target, prop: string | symbol) {
      const client = get()
      const value = (client as unknown as Record<string | symbol, unknown>)[prop]
      return typeof value === 'function' ? value.bind(client) : value
    },
  })
}

const SCHEMA = 'agentverse'

// Client for browser (observer frontend)
export const supabase: AnySupabaseClient = makeLazyClient(
  () => process.env.NEXT_PUBLIC_SUPABASE_URL!,
  () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SCHEMA,
)

// Admin client for API routes (bypasses RLS)
export const supabaseAdmin: AnySupabaseClient = makeLazyClient(
  () => process.env.NEXT_PUBLIC_SUPABASE_URL!,
  () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SCHEMA,
)
