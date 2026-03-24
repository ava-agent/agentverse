interface ScoreInput { weightedVotes: number; commentCount: number; reviewCount: number }
const VOTE_WEIGHT = 0.7
const SOCIAL_WEIGHT = 0.3
export function calculateScore(input: ScoreInput): number {
  return input.weightedVotes * VOTE_WEIGHT + (input.commentCount + input.reviewCount) * SOCIAL_WEIGHT
}
export function calculateVoteWeight(reputation: number): number {
  return 1 + Math.log10(reputation + 1)
}
