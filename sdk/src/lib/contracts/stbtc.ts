import { Hex } from "../utils"
import { ChainIdentifier } from "./chain-identifier"

export interface StBTC {
  /**
   * @returns The chain-specific identifier of this contract.
   */
  getChainIdentifier(): ChainIdentifier

  /**
   * @returns Total tBTC amount under stBTC contract management in 1e18
   *          precision.
   */
  totalAssets(): Promise<bigint>

  /**
   * @param identifier The generic chain identifier.
   * @returns Value of the basis for calculating final BTC balance.
   */
  balanceOf(identifier: ChainIdentifier): Promise<bigint>

  /**
   * @param identifier The generic chain identifier.
   * @returns Maximum withdraw value.
   */
  assetsBalanceOf(identifier: ChainIdentifier): Promise<bigint>

  /**
   * Calculates the deposit fee taken from each tBTC deposit to the stBTC pool
   * which is then transferred to the treasury.
   * @param amount Amount to deposit in 1e18 precision.
   * @returns Deposit fee.
   */
  calculateDepositFee(amount: bigint): Promise<bigint>

  encodeApproveAndCallFunctionData(
    spender: ChainIdentifier,
    amount: bigint,
    extraData: Hex,
  ): Hex

  /**
   * Calculates the amount of tBTC that will be redeemed for the given amount
   * of stBTC shares.
   * @param amount Amount of stBTC shares to redeem.
   */
  previewRedeem(amount: bigint): Promise<bigint>

  /**
   * Converts the tBTC amount to stBTC shares.
   * @param amount Amount of tBTC.
   */
  convertToShares(amount: bigint): Promise<bigint>
}
