type TxDetails = {
  timestamp: number
  action: string
  asset: string
  amount: number
  account: string
  txHash: string
  status: string
}

export type TxHistory = {
  callTx: TxDetails
  receiptTx: TxDetails
}
