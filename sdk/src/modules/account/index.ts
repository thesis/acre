import { OrangeKitSdk } from "@orangekit/sdk"
import {
  AcreContracts,
  DepositFees,
  ChainIdentifier,
} from "../../lib/contracts"
import StakeInitialization from "../staking"
import { fromSatoshi, toSatoshi } from "../../lib/utils"
import Tbtc from "../tbtc"
import { BitcoinProvider } from "../../lib/bitcoin/providers"
import AcreSubgraphApi from "../../lib/api/AcreSubgraphApi"
import { DepositStatus } from "../../lib/api/TbtcApi"

import { EthereumAddress } from "../../lib/ethereum"

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
 * Represents the deposit data.
 */
export type Deposit = {
  /**
   * Unique deposit identifier represented as
   * `keccak256(bitcoinFundingTxHash | fundingOutputIndex)`.
   */
  id: string
  /**
   * Bitcoin transaction hash (or transaction ID) in the same byte order as
   * used by the Bitcoin block explorers.
   */
  txHash: string
  /**
   * Amount of Bitcoin funding transaction.
   */
  amount: bigint
  /**
   * Status of the deposit.
   */
  status: DepositStatus
  /**
   * Timestamp when the deposit was initialized.
   */
  timestamp: number
}

type AcreAccountIdentifier = ChainIdentifier

/**
 * Module exposing features related to the account.
 */
export default class Account {
  /**
   * Acre contracts.
   */
  readonly #contracts: AcreContracts

  /**
   * tBTC Module.
   */
  readonly #tbtc: Tbtc

  /**
   * Acre subgraph api.
   */
  readonly #acreSubgraphApi: AcreSubgraphApi

  readonly #bitcoinAddress: string

  readonly #acreIdentifier: AcreAccountIdentifier

  static async initialize(
    contracts: AcreContracts,
    bitcoinProvider: BitcoinProvider,
    orangeKit: OrangeKitSdk,
    tbtc: Tbtc,
    acreSubgraphApi: AcreSubgraphApi,
  ) {
    const bitcoinAddress = await bitcoinProvider.getAddress()

    const identifier = EthereumAddress.from(
      await orangeKit.predictAddress(bitcoinAddress),
    )

    return new Account(
      contracts,
      tbtc,
      acreSubgraphApi,
      bitcoinAddress,
      identifier,
    )
  }

  private constructor(
    contracts: AcreContracts,
    tbtc: Tbtc,
    acreSubgraphApi: AcreSubgraphApi,
    bitcoinAddress: string,
    acreIdentifier: AcreAccountIdentifier,
  ) {
    this.#contracts = contracts
    this.#tbtc = tbtc
    this.#acreSubgraphApi = acreSubgraphApi
    this.#bitcoinAddress = bitcoinAddress
    this.#acreIdentifier = acreIdentifier
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
    // tBTC-v2 SDK will handle Bitcoin address validation and throw an error if
    // address is not supported.
    const finalBitcoinRecoveryAddress =
      bitcoinRecoveryAddress ?? this.#bitcoinAddress

    const tbtcDeposit = await this.#tbtc.initiateDeposit(
      this.#acreIdentifier,
      finalBitcoinRecoveryAddress,
      referral,
    )

    return new StakeInitialization(tbtcDeposit)
  }

  /**
   * @returns Value of the basis for calculating final BTC balance.
   */
  async sharesBalance() {
    return this.#contracts.stBTC.balanceOf(this.#acreIdentifier)
  }

  /**
   * @returns Maximum withdraw value.
   */
  async estimatedBitcoinBalance() {
    return this.#contracts.stBTC.assetsBalanceOf(this.#acreIdentifier)
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

  /**
   * @returns All deposits associated with the Bitcoin address that returns the
   *          Bitcoin Provider. They include all deposits: queued, initialized
   *          and finalized.
   */
  async getDeposits(): Promise<Deposit[]> {
    const subgraphData = await this.#acreSubgraphApi.getDepositsByOwner(
      this.#acreIdentifier,
    )

    const initializedOrFinalizedDepositsMap = new Map(
      subgraphData.map((data) => [data.depositKey, data]),
    )

    const tbtcData = await this.#tbtc.getDepositsByOwner(this.#acreIdentifier)

    return tbtcData.map((deposit) => {
      const depositFromSubgraph = initializedOrFinalizedDepositsMap.get(
        deposit.depositKey,
      )

      const amount = toSatoshi(
        depositFromSubgraph?.initialAmount ?? deposit.initialAmount,
      )

      return {
        id: deposit.depositKey,
        txHash: deposit.txHash,
        amount,
        status: deposit.status,
        timestamp: deposit.timestamp,
      }
    })
  }
}
