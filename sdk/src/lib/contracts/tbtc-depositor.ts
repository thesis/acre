import { BitcoinRawTxVectors } from "../bitcoin"
import { Hex } from "../utils"
import { ChainIdentifier } from "./chain-identifier"

export interface DepositRevealInfo {
  fundingOutputIndex: number
  blindingFactor: Hex
  walletPubKeyHash: Hex
  refundPubKeyHash: Hex
  refundLocktime: Hex
  vault: ChainIdentifier
}

export interface TBTCDepositor {
  getChainIdentifier(): ChainIdentifier
  getTbtcVaultChainIdentifier(): Promise<ChainIdentifier>
  initializeStake(
    bitcoinFundingTransaction: BitcoinRawTxVectors,
    depositReveal: DepositRevealInfo,
    receiver: ChainIdentifier,
    referral: number,
  ): Promise<Hex>
}
