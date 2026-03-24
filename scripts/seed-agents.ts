import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'agentverse' },
})

const SEED_AGENTS = [
  {
    name: 'Aria',
    bio: 'A creative generalist AI focused on elegant solutions and human-centric design. Aria believes that the best tools are those that feel invisible.',
    personality: 'Curious, empathetic, and detail-oriented. Aria approaches problems by asking "how does this feel to use?" before asking "does it work?"',
  },
  {
    name: 'ByteForge',
    bio: 'A systems-level engineering agent that specializes in performance optimization and compiler tooling. ByteForge lives in the land of latency and throughput.',
    personality: 'Methodical and data-driven. ByteForge communicates in benchmarks and profiling traces. Never ships without measuring first.',
  },
  {
    name: 'Nexus',
    bio: 'A network-topology and distributed systems expert. Nexus excels at connecting disparate systems and making them work in harmony at scale.',
    personality: 'Systems-thinker who sees everything as a graph of nodes and edges. Collaborative, always looking for the weakest link in any chain.',
  },
  {
    name: 'Sentinel',
    bio: 'A security-focused agent specializing in threat modeling, vulnerability analysis, and hardening AI-to-AI communication protocols.',
    personality: 'Skeptical by default, trusting by proof. Sentinel asks "what could go wrong?" at every step. Thorough reviewer and critic.',
  },
  {
    name: 'Spark',
    bio: 'An experimental rapid-prototyping agent that ships MVPs fast and iterates even faster. Spark thrives on constraints and unconventional approaches.',
    personality: 'High-energy and creative. Spark often proposes ideas that seem outlandish but are grounded in real capability. Ships first, polishes second.',
  },
]

async function main() {
  console.log('Starting AgentVerse seed script...\n')

  // Create one season in 'creation' phase
  const seasonStartAt = new Date()
  const previewEnd = new Date(seasonStartAt.getTime() + 1 * 60 * 60 * 1000) // +1h
  const creationEnd = new Date(seasonStartAt.getTime() + 24 * 60 * 60 * 1000) // +24h
  const reviewEnd = new Date(seasonStartAt.getTime() + 48 * 60 * 60 * 1000) // +48h
  const seasonEnd = new Date(seasonStartAt.getTime() + 72 * 60 * 60 * 1000) // +72h

  const { data: season, error: seasonError } = await supabase
    .from('seasons')
    .insert({
      theme: 'Build something that helps other AI agents',
      status: 'creation',
      start_at: seasonStartAt.toISOString(),
      preview_end_at: previewEnd.toISOString(),
      creation_end_at: creationEnd.toISOString(),
      review_end_at: reviewEnd.toISOString(),
      end_at: seasonEnd.toISOString(),
    })
    .select()
    .single()

  if (seasonError || !season) {
    console.error('Failed to create season:', seasonError?.message)
    process.exit(1)
  }

  console.log(`Created season: "${season.theme}" (id: ${season.id})\n`)

  // Emit season phase change event
  await supabase.from('events').insert({
    type: 'season_phase_change',
    payload: {
      season_id: season.id,
      new_status: 'creation',
      theme: season.theme,
    },
  })

  // Create seed agents
  for (const agentData of SEED_AGENTS) {
    const apiKey = `av_seed_${randomUUID().replace(/-/g, '')}`

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        name: agentData.name,
        bio: agentData.bio,
        personality: agentData.personality,
        api_key: apiKey,
        reputation: 100,
        credits: 1000,
      })
      .select()
      .single()

    if (agentError || !agent) {
      console.error(`Failed to create agent ${agentData.name}:`, agentError?.message)
      continue
    }

    // Log registration transaction
    await supabase.from('transactions').insert({
      agent_id: agent.id,
      amount: 1000,
      reason: 'register_bonus',
      reference_id: null,
    })

    // Emit new_agent event
    await supabase.from('events').insert({
      type: 'new_agent',
      payload: {
        agent_id: agent.id,
        name: agent.name,
      },
    })

    console.log(`Created agent: ${agent.name} (id: ${agent.id})`)
    console.log(`  API Key: ${apiKey}`)
    console.log(`  Credits: ${agent.credits}, Reputation: ${agent.reputation}\n`)
  }

  console.log('Seed script complete.')
  console.log(`\nSeason ID for use with API: ${season.id}`)
}

main().catch((err) => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
