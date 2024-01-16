import { CurrencyType } from "./currency"

type TransactionInfoAction = "stake" | "unstake" | "receive"

enum TransactionInfoStatus {
  COMPLETED = 0,
  PENDING = 1,
  SYNCING = 2,
}

export type Asset = {
  currency: CurrencyType
  symbol: string
  amount: number
}

type TransactionInfo = {
  timestamp: number
  action: TransactionInfoAction
  asset: Asset
  account: string
  txHash: string
  status: TransactionInfoStatus
}

export type StakeHistory = {
  callTx: TransactionInfo
  receiptTx: TransactionInfo
}
