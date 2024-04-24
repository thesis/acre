import { Deposit as TbtcDeposit } from "@keep-network/tbtc-v2.ts"

import type { DepositReceipt as TbtcSdkDepositReceipt } from "@keep-network/tbtc-v2.ts"
import type { SaveRevealRequest as DepositRevealData } from "../../api/TbtcApi"

import TbtcApi from "../../api/TbtcApi"

import { backoffRetrier, RetryOptions } from "../../lib/utils"

export type DepositReceipt = TbtcSdkDepositReceipt

/**
 * Represents a deposit for the tBTC protocol.
 */
export default class Deposit {
  readonly #tbtcApi: TbtcApi

  readonly #tbtcDeposit: TbtcDeposit

  readonly #revealData: DepositRevealData

  constructor(
    tbtcApi: TbtcApi,
    tbtcDeposit: TbtcDeposit,
    revealData: DepositRevealData,
  ) {
    this.#tbtcApi = tbtcApi
    this.#tbtcDeposit = tbtcDeposit
    this.#revealData = revealData
  }

  /**
   * Retrieves the Bitcoin address corresponding to this deposit.
   * This address should be used as the destination for sending BTC to fund the
   * deposit.
   * @returns The Bitcoin address corresponding to this deposit.
   */
  async getBitcoinAddress(): Promise<string> {
    return this.#tbtcDeposit.getBitcoinAddress()
  }

  /**
   * Retrieves the receipt corresponding to the tbtc deposit.
   * @returns The deposit receipt.
   */
  getReceipt(): DepositReceipt {
    return this.#tbtcDeposit.getReceipt()
  }

  /**
   * Waits for the deposit to be funded with BTC.
   * @param options The retry options for waiting.
   * @throws Error if the deposit is not funded within the specified retries.
   */
  async waitForFunding(options: RetryOptions): Promise<void> {
    await backoffRetrier<void>(
      options.retires,
      options.backoffStepMs,
    )(async () => {
      const utxos = await this.#tbtcDeposit.detectFunding()

      if (utxos.length === 0) throw new Error("Deposit not funded yet")
    })
  }

  /**
   * Creates a bitcoin deposit on the tBTC API backend side.
   * This function should be called after the bitcoin transaction is made to the
   * deposit address.
   * @throws Error if the deposit creation fails on the tBTC API side or the bitcoin
   *         funding transaction couldn't be found.
   * @returns The tBTC API deposit ID.
   */
  async createDeposit(): Promise<string> {
    const { revealInfo, metadata } = this.#revealData
    const { depositOwner, referral } = metadata

    const createBitcoinDepositData = {
      depositReceipt: revealInfo,
      depositOwner,
      referral,
    }

    const response = await this.#tbtcApi.createDeposit(createBitcoinDepositData)

    // TODO: Determine return type based on dApp needs, possibly calculate depositKey.
    return response.depositId
  }
}
