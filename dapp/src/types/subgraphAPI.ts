export type ActivityDataResponse = {
  id: string
  bitcoinTransactionId: string
  amountToDeposit: string
  events: { type: "Initialized" | "Finalized" }[]
}
