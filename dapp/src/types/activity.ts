export type Activity = {
  id: string
  timestamp: number
  txHash: string
  amount: bigint
  status: "completed" | "pending"
  type: "deposit" | "withdraw"
}

export type ActivitiesByIds = {
  [id: string]: Activity
}
