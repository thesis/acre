export const ACTION_FLOW_TYPES = {
  STAKE: "STAKE",
  UNSTAKE: "UNSTAKE",
} as const

export type ActionFlowType =
  (typeof ACTION_FLOW_TYPES)[keyof typeof ACTION_FLOW_TYPES]

const STAKING_STEPS = {
  DEPOSIT_BTC: 1,
} as const

const UNSTAKING_STEPS = { SIGN_MESSAGE: 1 } as const

export const ACTION_FLOW_STEPS_TYPES = {
  [ACTION_FLOW_TYPES.STAKE]: STAKING_STEPS,
  [ACTION_FLOW_TYPES.UNSTAKE]: UNSTAKING_STEPS,
} as const

export const PROCESS_STATUSES = {
  IDLE: "IDLE",
  LOADING: "LOADING",
  FAILED: "FAILED",
  SUCCEEDED: "SUCCEEDED",
} as const

export type ProcessStatus =
  (typeof PROCESS_STATUSES)[keyof typeof PROCESS_STATUSES]
