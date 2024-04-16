import { ChainIdentifier, TBTC } from "@keep-network/tbtc-v2.ts"
import { AcreContracts, DepositorProxy, DepositFees } from "../../lib/contracts"
import { ChainEIP712Signer } from "../../lib/eip712-signer"
import { StakeInitialization } from "./stake-initialization"
import { toSatoshi } from "../../lib/utils"

/**
 * Represents all total deposit fees grouped by network.
 */
export type TotalDepositFees = {
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
   * tBTC SDK.
   */
  readonly #tbtc: TBTC

  constructor(
    _contracts: AcreContracts,
    _messageSigner: ChainEIP712Signer,
    _tbtc: TBTC,
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
   * @param depositorProxy Depositor proxy used to initiate the deposit.
   * @returns Object represents the staking process.
   */
  async initializeStake(
    bitcoinRecoveryAddress: string,
    staker: ChainIdentifier,
    referral: number,
    depositorProxy?: DepositorProxy,
  ) {
    const deposit = await this.#tbtc.deposits.initiateDepositWithProxy(
      bitcoinRecoveryAddress,
      depositorProxy ?? this.#contracts.bitcoinDepositor,
      this.#contracts.bitcoinDepositor.encodeExtraData(staker, referral),
    )

    return new StakeInitialization(
      this.#contracts,
      this.#messageSigner,
      bitcoinRecoveryAddress,
      staker,
      deposit,
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
   * Estimates the deposit fees based on the provided amount.
   * @param amount Amount to deposit in satoshi.
   * @returns Deposit fees grouped by tBTC and Acre networks in 1e8 satoshi
   *          precision and total deposit fees value.
   */
  async estimateDepositFees(amount: bigint): Promise<TotalDepositFees> {
    const { acre: acreFees, tbtc: tbtcFees } =
      await this.#contracts.bitcoinDepositor.estimateDepositFees(amount)

    const sumFeesByNetwork = <
      T extends DepositFees["tbtc"] | DepositFees["acre"],
    >(
      fees: T,
    ) => Object.values(fees).reduce((reducer, fee) => reducer + fee, 0n)

    const tbtc = toSatoshi(sumFeesByNetwork(tbtcFees))

    const acre = toSatoshi(sumFeesByNetwork(acreFees))

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
