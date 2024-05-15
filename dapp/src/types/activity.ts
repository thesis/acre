import { DepositStatus } from "@acre-btc/sdk"
import { CurrencyType } from "./currency"

// TODO: Update type when subgraph's ready
type ActivityInfoAction = "stake" | "unstake" | "receive"

export type ActivityInfoStatus = "completed" | "pending" | "syncing"

export type ActivityInfo = {
  action: ActivityInfoAction
  currency: CurrencyType
  amount: number
  txHash: string
  status: ActivityInfoStatus
}

export type Activity = {
  txHash: string
  amount: bigint
  status: DepositStatus
  type?: "deposit" | "withdraw"
}
