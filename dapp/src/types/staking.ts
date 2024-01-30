import { CurrencyType } from "./currency"

export type ActionFlowType = "stake" | "unstake"

export const ACTION_FLOW_STEPS_TYPES: Record<
  ActionFlowType,
  Record<string, number>
> = {
  stake: { OVERVIEW: 1, SIGN_MESSAGE: 2, DEPOSIT_BTC: 3 },
  unstake: { SIGN_MESSAGE: 1 },
}

export type TokenAmount = {
  amount: bigint
  currency: CurrencyType
}
