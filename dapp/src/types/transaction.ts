import { Chain } from "./chain"
import { CurrencyType } from "./currency"

type TransactionInfoAction = "stake" | "unstake" | "receive"

export type TransactionInfoStatus = "completed" | "pending" | "syncing"

export type TransactionInfo = {
  timestamp: number
  chain: Chain
  action: TransactionInfoAction
  currency: CurrencyType
  amount: number
  account: string
  txHash?: string
  // TODO: Update when statuses for transactions are determined
  status?: TransactionInfoStatus
}

export type StakeHistory = {
  callTx: TransactionInfo
  receiptTx: TransactionInfo
}
