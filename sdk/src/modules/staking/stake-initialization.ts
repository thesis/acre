import TbtcDeposit from "../tbtc/Deposit"

import type { DepositReceipt } from "."

/**
 * Represents an instance of the staking flow. Staking flow requires a few steps
 * which should be done to stake BTC.
 */
export default class StakeInitialization {
  /**
   * Component representing an instance of the tBTC deposit process.
   */
  readonly #tbtcDeposit: TbtcDeposit

  constructor(tbtcDeposit: TbtcDeposit) {
    this.#tbtcDeposit = tbtcDeposit
  }

  /**
   * @dev It should be used as a first step of the staking flow and user should
   *      send BTC to returned Bitcoin address.
   * @returns Bitcoin address corresponding to this deposit.
   */
  async getBitcoinAddress(): Promise<string> {
    return this.#tbtcDeposit.getBitcoinAddress()
  }

  /**
   * @returns Receipt corresponding to the tbtc deposit.
   */
  getDepositReceipt(): DepositReceipt {
    return this.#tbtcDeposit.getReceipt()
  }

  /**
   * Stakes BTC based on the Bitcoin funding transaction via BitcoinDepositor
   * contract. It requires signed staking message, which means `stake` should be
   * called after message signing. By default, it detects and uses the outpoint
   * of the recent Bitcoin funding transaction and throws if such a transaction
   * does not exist.
   * @dev Use it as the last step of the staking flow. It requires signed
   *      staking message otherwise throws an error.
   * @param options Optional options parameters to initialize stake.
   *                @see StakeOptions for more details.
   * @returns Transaction hash of the stake initiation transaction.
   */
  async stake(options = { retries: 5, backoffStepMs: 5_000 }): Promise<string> {
    await this.#tbtcDeposit.waitForFunding(options)

    return this.#tbtcDeposit.createDeposit()
  }
}
