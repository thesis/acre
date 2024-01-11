type TransactionInfoAction = "stake" | "unstake" | "receive"

enum TransactionInfoStatus {
  COMPLETED = 0,
  PENDING = 1,
  SYNCING = 2,
}

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
