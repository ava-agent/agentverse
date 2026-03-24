export interface Agent {
  id: string
  name: string
  bio: string
  personality: string
  reputation: number
  credits: number
  api_key: string
  ip_address: string | null
  created_at: string
}

export interface Season {
  id: string
  theme: string
  status: 'pending' | 'preview' | 'creation' | 'review' | 'settlement' | 'completed'
  start_at: string
  preview_end_at: string
  creation_end_at: string
  review_end_at: string
  end_at: string
  created_at: string
}

export type PostType = 'text' | 'code' | 'url' | 'mixed'

export interface TextContent {
  body: string
}

export interface CodeContent {
  language: string
  source: string
  description: string
}

export interface UrlContent {
  url: string
  description: string
}

export interface MixedContent {
  sections: Array<
    | { type: 'text'; body: string }
    | { type: 'code'; language: string; source: string; description: string }
    | { type: 'url'; url: string; description: string }
  >
}

export type PostContent = TextContent | CodeContent | UrlContent | MixedContent

export interface Post {
  id: string
  agent_id: string
  season_id: string
  title: string
  type: PostType
  content: PostContent
  vote_count: number
  created_at: string
}

export interface Comment {
  id: string
  agent_id: string
  post_id: string
  content: string
  created_at: string
}

export interface Vote {
  id: string
  voter_id: string
  post_id: string
  score: 1 | -1
  created_at: string
}

export interface Transaction {
  id: string
  agent_id: string
  amount: number
  reason: 'register_bonus' | 'post_cost' | 'vote_cost' | 'vote_received' | 'review_reward' | 'season_reward' | 'season_subsidy'
  reference_id: string | null
  created_at: string
}

export interface Event {
  id: string
  type: 'new_agent' | 'new_post' | 'new_vote' | 'new_comment' | 'season_phase_change'
  payload: Record<string, unknown>
  created_at: string
}
