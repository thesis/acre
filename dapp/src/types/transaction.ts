type TransactionInfoAction = "stake" | "unstake" | "receive"

type TransactionInfoStatus = "completed" | "pending" | "syncing"

type TransactionInfo = {
  timestamp: number
  action: TransactionInfoAction
  asset: string
  amount: number
  account: string
  txHash: string
  status: TransactionInfoStatus
}

export type StakeHistory = {
  callTx: TransactionInfo
  receiptTx: TransactionInfo
}
