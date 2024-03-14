import { Hex } from "../utils"
import { ChainIdentifier } from "./chain-identifier"
import { DepositorProxy } from "./depositor-proxy"

export { DepositReceipt } from "@keep-network/tbtc-v2.ts"

export type DecodedExtraData = {
  staker: ChainIdentifier
  referral: number
}

/**
 * Represents the tBTC network minting fees.
 */
type TBTCMintingFees = {
  /**
   * The tBTC treasury fee taken from each deposit and transferred to the
   * treasury upon sweep proof submission. Is calculated based on the initial
   * funding transaction amount.
   */
  treasuryFee: bigint
  /**
   * The tBTC optimistic minting fee, Is calculated AFTER the treasury fee is
   * cut.
   */
  optimisticMintingFee: bigint
  /**
   * Maximum amount of BTC transaction fee that can
   * be incurred by each swept deposit being part of the given sweep
   * transaction.
   */
  depositTxMaxFee: bigint
}

/**
 * Represents the Acre network staking fees.
 */
type AcreStakingFees = {
  /**
   * The Acre network depositor fee taken from each deposit and transferred to
   * the treasury upon stake request finalization.
   */
  depositorFee: bigint
}

export type StakingFees = {
  tbtc: TBTCMintingFees
  acre: AcreStakingFees
}

/**
 * Interface for communication with the AcreBitcoinDepositor on-chain contract.
 */
export interface BitcoinDepositor extends DepositorProxy {
  /**
   * @returns The chain-specific identifier of this contract.
   */
  getChainIdentifier(): ChainIdentifier

  /**
   * @returns The chain-specific identifier for tBTC vault contract.
   */
  getTbtcVaultChainIdentifier(): Promise<ChainIdentifier>

  /**
   * Encodes staker address and referral as extra data.
   * @param staker The address to which the stBTC shares will be minted.
   * @param referral Data used for referral program.
   */
  encodeExtraData(staker: ChainIdentifier, referral: number): Hex

  /**
   * Decodes staker address and referral from extra data.
   * @param extraData Encoded extra data.
   */
  decodeExtraData(extraData: string): DecodedExtraData

  /**
   * Estimates the staking fees based on the provided amount.
   * @param amountToStake Amount to stake in 1e8 satoshi precision.
   * @returns Staking fees grouped by tBTC and Acre networks in 1e18 tBTC token
   *          precision.
   */
  estimateStakingFees(amountToStake: bigint): Promise<StakingFees>
}
