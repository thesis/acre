type CommonActivityData = {
  id: string
  timestamp: number
  amount: bigint
  status: "completed" | "pending"
}

type ConditionalActivityData =
  | {
      type: "deposit"
      txHash: string
    }
  | {
      type: "withdraw"
      txHash?: string
    }

export type Activity = CommonActivityData & ConditionalActivityData

export type ActivitiesByIds = {
  [id: string]: Activity
}
