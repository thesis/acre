import { ChainIdentifier } from "@keep-network/tbtc-v2.ts"
import { AcreContracts, DepositFees } from "../../lib/contracts"
import { ChainEIP712Signer } from "../../lib/eip712-signer"
import { StakeInitialization } from "./stake-initialization"
import { fromSatoshi, toSatoshi } from "../../lib/utils"
import Tbtc from "../tbtc"

/**
 * Represents all total deposit fees grouped by network.
 */
export type DepositFee = {
  tbtc: bigint
  acre: bigint
  total: bigint
}

/**
 * Module exposing features related to the staking.
 */
class StakingModule {
  /**
   * Acre contracts.
   */
  readonly #contracts: AcreContracts

  /**
   * Typed structured data signer.
   */
  readonly #messageSigner: ChainEIP712Signer

  /**
   * tBTC Module.
   */
  readonly #tbtc: Tbtc

  constructor(
    _contracts: AcreContracts,
    _messageSigner: ChainEIP712Signer,
    _tbtc: Tbtc,
  ) {
    this.#contracts = _contracts
    this.#messageSigner = _messageSigner
    this.#tbtc = _tbtc
  }

  /**
   * Initializes the Acre staking process.
   * @param bitcoinRecoveryAddress P2PKH or P2WPKH Bitcoin address that can be
   *                               used for emergency recovery of the deposited
   *                               funds.
   * @param staker The address to which the stBTC shares will be minted.
   * @param referral Data used for referral program.
   * @returns Object represents the staking process.
   */
  async initializeStake(
    bitcoinRecoveryAddress: string,
    staker: ChainIdentifier, // TODO: We should resolve the address with OrangeKit SDK
    referral: number,
  ) {
    const tbtcDeposit = await this.#tbtc.initiateDeposit(
      staker,
      bitcoinRecoveryAddress,
      referral,
    )

    return new StakeInitialization(
      this.#contracts,
      this.#messageSigner,
      bitcoinRecoveryAddress,
      staker,
      tbtcDeposit,
    )
  }

  /**
   * @param identifier The generic chain identifier.
   * @returns Value of the basis for calculating final BTC balance.
   */
  sharesBalance(identifier: ChainIdentifier) {
    return this.#contracts.stBTC.balanceOf(identifier)
  }

  /**
   * @param identifier The generic chain identifier.
   * @returns Maximum withdraw value.
   */
  estimatedBitcoinBalance(identifier: ChainIdentifier) {
    return this.#contracts.stBTC.assetsBalanceOf(identifier)
  }

  /**
   * Estimates the deposit fee based on the provided amount.
   * @param amount Amount to deposit in satoshi.
   * @returns Deposit fee grouped by tBTC and Acre networks in 1e8 satoshi
   *          precision and total deposit fee value.
   */
  async estimateDepositFee(amount: bigint): Promise<DepositFee> {
    const amountInTokenPrecision = fromSatoshi(amount)

    const { acre: acreFees, tbtc: tbtcFees } =
      await this.#contracts.bitcoinDepositor.calculateDepositFee(
        amountInTokenPrecision,
      )
    const depositFee = await this.#contracts.stBTC.calculateDepositFee(
      amountInTokenPrecision,
    )

    const sumFeesByProtocol = <
      T extends DepositFees["tbtc"] | DepositFees["acre"],
    >(
      fees: T,
    ) => Object.values(fees).reduce((reducer, fee) => reducer + fee, 0n)

    const tbtc = toSatoshi(sumFeesByProtocol(tbtcFees))

    const acre = toSatoshi(sumFeesByProtocol(acreFees)) + toSatoshi(depositFee)

    return {
      tbtc,
      acre,
      total: tbtc + acre,
    }
  }

  /**
   * @returns Minimum deposit amount in 1e8 satoshi precision.
   */
  async minDepositAmount() {
    const value = await this.#contracts.bitcoinDepositor.minDepositAmount()
    return toSatoshi(value)
  }
}

export { StakingModule, StakeInitialization }
