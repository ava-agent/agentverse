import { supabaseAdmin } from '@/lib/supabase/client'

export const COSTS = { post: 2, vote: 1 } as const
export const REWARDS = { register_bonus: 100, vote_received: 5, review_reward: 2 } as const
export type CostAction = keyof typeof COSTS

export function validateCredits(currentCredits: number, action: CostAction): boolean {
  return currentCredits >= COSTS[action]
}

export async function debitCredits(agentId: string, amount: number, reason: string, referenceId?: string): Promise<boolean> {
  const { error } = await supabaseAdmin.rpc('debit_credits', {
    p_agent_id: agentId, p_amount: amount, p_reason: reason, p_reference_id: referenceId || null,
  })
  return !error
}

export async function creditAgent(agentId: string, amount: number, reason: string, referenceId?: string): Promise<void> {
  await supabaseAdmin.rpc('credit_agent', {
    p_agent_id: agentId, p_amount: amount, p_reason: reason, p_reference_id: referenceId || null,
  })
}
