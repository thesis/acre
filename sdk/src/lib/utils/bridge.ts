import { DepositReceipt } from "@keep-network/tbtc-v2.ts"

type RevealMetadata = {
  depositOwner: string
  referral: number
}

type SaveRevealRequest = {
  address: string
  revealInfo: DepositReceipt
  metadata: RevealMetadata
  application: string
}

export { DepositReceipt, SaveRevealRequest }
