import { ChainIdentifier, EthereumAddress } from "@keep-network/tbtc-v2.ts"
import { OrangeKitSdk } from "@orangekit/sdk"
import { AcreContracts, DepositFees } from "../../lib/contracts"
import { StakeInitialization } from "./stake-initialization"
import { fromSatoshi, toSatoshi } from "../../lib/utils"
import Tbtc from "../tbtc"
import { BitcoinProvider } from "../../lib/bitcoin/providers"

export { DepositReceipt } from "../tbtc"

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
  readonly #bitcoinProvider: BitcoinProvider

  /**
   * tBTC Module.
   */
  readonly #tbtc: Tbtc

  /**
   * OrangeKit SDK.
   */
  readonly #orangeKit: OrangeKitSdk

  constructor(
    _contracts: AcreContracts,
    _bitcoinProvider: BitcoinProvider,
    _orangeKit: OrangeKitSdk,
    _tbtc: Tbtc,
  ) {
    this.#contracts = _contracts
    this.#bitcoinProvider = _bitcoinProvider
    this.#tbtc = _tbtc
    this.#orangeKit = _orangeKit
  }

  /**
   * Initializes the Acre deposit process.
   * @param referral Data used for referral program.
   * @param bitcoinRecoveryAddress `P2PKH` or `P2WPKH` Bitcoin address that can
   *        be used for emergency recovery of the deposited funds. If
   *        `undefined` the bitcoin address from bitcoin provider is used as
   *        bitcoin recovery address - note that an address returned by bitcoin
   *        provider must then be `P2WPKH` or `P2PKH`. This property is
   *        available to let the consumer use `P2SH-P2WPKH` as the deposit owner
   *        and another tBTC-supported type (`P2WPKH`, `P2PKH`) address as the
   *        tBTC Bridge recovery address.
   * @returns Object represents the deposit process.
   */
  async initializeStake(referral: number, bitcoinRecoveryAddress?: string) {
    const depositorOwnerBitcoinAddress =
      await this.#bitcoinProvider.getAddress()

    // TODO: If we want to handle other chains we should create the wrapper for
    // OrangeKit SDK to return `ChainIdentifier` from `predictAddress` fn. Or we
    // can create `EVMChainIdentifier` class and use it as a type in `modules`
    // and `lib`. Currently we support only `Ethereum` so here we force to
    // `EthereumAddress`.
    const depositOwnerChainAddress = EthereumAddress.from(
      await this.#orangeKit.predictAddress(depositorOwnerBitcoinAddress),
    )

    // tBTC-v2 SDK will handle Bitcoin address validation and throw an error if
    // address is not supported.
    const finalBitcoinRecoveryAddress =
      bitcoinRecoveryAddress ?? depositorOwnerBitcoinAddress

    const tbtcDeposit = await this.#tbtc.initiateDeposit(
      depositOwnerChainAddress,
      finalBitcoinRecoveryAddress,
      referral,
    )

    return new StakeInitialization(
      this.#contracts,
      this.#bitcoinProvider,
      finalBitcoinRecoveryAddress,
      depositOwnerChainAddress,
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
