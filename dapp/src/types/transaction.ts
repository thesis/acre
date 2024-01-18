import { Chain } from "./chain"
import { CurrencyType } from "./currency"

type TransactionInfoAction = "stake" | "unstake" | "receive"

export type TransactionInfoStatus = "completed" | "pending" | "syncing"

export type Asset = {
  currency: CurrencyType
  amount: number
}

export type TransactionInfo = {
  timestamp: number
  chain: Chain
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
