import { CurrencyType } from "./currency"

export type ActionFlowType = "stake" | "unstake"

export type TokenAmount = {
  amount: bigint
  currency: CurrencyType
}
