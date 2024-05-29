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
  id: string
  timestamp: number
  txHash: string
  amount: bigint
  type: "deposit" | "withdraw"
  status: "completed" | "pending"
}

export type ActivitiesByIds = {
  [id: string]: Activity
}
