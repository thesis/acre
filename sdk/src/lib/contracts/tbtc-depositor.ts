import { BitcoinRawTxVectors } from "../bitcoin"
import { Hex } from "../utils"
import { ChainIdentifier } from "./chain-identifier"

/**
 * Represents data of the revealed deposit.
 */
export interface DepositRevealInfo {
  /**
   * Index of the deposit transaction output that funds the revealed deposit.
   */
  fundingOutputIndex: number

  /**
   * An 8-byte blinding factor. Must be unique for the given depositor, wallet
   * public key and refund public key.
   */
  blindingFactor: Hex

  /**
   * Public key hash of the wallet that is meant to receive the deposit.
   */
  walletPublicKeyHash: Hex

  /**
   * Public key hash that is meant to be used during deposit refund after the
   * locktime passes.
   */
  refundPublicKeyHash: Hex

  /**
   * A 4-byte little-endian refund locktime.
   */
  refundLocktime: Hex
}

/**
 * Interface for communication with the TBTCDepositor on-chain contract.
 */
export interface TBTCDepositor {
  /**
   * @returns The chain-specific identifier of this contract.
   */
  getChainIdentifier(): ChainIdentifier

  /**
   * @returns The chain-specific identifier for tBTC vault contract.
   */
  getTbtcVaultChainIdentifier(): Promise<ChainIdentifier>

  /**
   * Initializes stake for a Bitcoin deposit made by an user with a P2(W)SH
   * transaction. It uses the supplied information to reveal a deposit to the
   * tBTC Bridge contract.
   * @param bitcoinFundingTransaction Bitcoin funding transaction data.
   * @param depositReveal Data of the revealed deposit.
   * @param receiver The address to which the stBTC shares will be minted.
   * @param referral Data used for referral program.
   * @returns Transaction hash of the stake initiation transaction.
   */
  initializeStake(
    bitcoinFundingTransaction: BitcoinRawTxVectors,
    depositReveal: DepositRevealInfo,
    receiver: ChainIdentifier,
    referral: number,
  ): Promise<Hex>
}
