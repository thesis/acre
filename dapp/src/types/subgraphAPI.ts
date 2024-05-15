export type ActivityDataResponse = {
  id: string
  bitcoinTransactionId: string
  amountToDeposit: string
  events: { timestamp: string; type: "Initialized" | "Finalized" }[]
}
