export const REFERRALS = {
  STAKING_REWARDS: 48450,
} as const

export type Referral = (typeof REFERRALS)[keyof typeof REFERRALS]
