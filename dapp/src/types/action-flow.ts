const STAKING_STEPS = {
  OVERVIEW: 1,
  SIGN_MESSAGE: 2,
  DEPOSIT_BTC: 3,
}

const UNSTAKING_STEPS = { SIGN_MESSAGE: 1 }

export const ACTION_FLOW_STEPS_TYPES = {
  stake: STAKING_STEPS,
  unstake: UNSTAKING_STEPS,
} as const

export type ActionFlowType = keyof typeof ACTION_FLOW_STEPS_TYPES
