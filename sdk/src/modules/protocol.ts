import { AcreContracts, DepositFees } from "../lib/contracts"
import { fromSatoshi, toSatoshi } from "../lib/utils"

/**
 * Represents all total deposit fees grouped by network.
 */
export type DepositFee = {
  tbtc: bigint
  acre: bigint
  total: bigint
}

/**
 * Module exposing general functions related to the Acre protocol.
 */
export default class Protocol {
  /**
   * Acre contracts.
   */
  readonly #contracts: AcreContracts

  constructor(contracts: AcreContracts) {
    this.#contracts = contracts
  }

  /**
   * @returns Total Bitcoin amount under protocol management in 1e8 satoshi
   *          precision.
   */
  async totalAssets() {
    return toSatoshi(await this.#contracts.stBTC.totalAssets())
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
  async minimumDepositAmount() {
    const value = await this.#contracts.bitcoinDepositor.minDepositAmount()
    return toSatoshi(value)
  }
}
