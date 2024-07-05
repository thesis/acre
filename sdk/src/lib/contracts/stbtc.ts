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

  /**
   * Calculates the withdrawal fee taken from each tBTC withdrawal from the stBTC
   * pool which is then transferred to the treasury.
   * @param amount Amount to withdraw in 1e18 precision.
   * @returns Withdrawal fee.
   */
  calculateWithdrawalFee(amount: bigint): Promise<bigint>

  /**
   * Encodes the transaction data for a transaction that calls the
   * `approveAndCall` function. The `approveAndCall` function allows `spender`
   * to spend no more than `amount` stBTC tokens on user's behalf and then ping
   * the contract about it.
   * @param spender The address authorized to spend.
   * @param shares The max amount they can spend.
   * @param extraData Extra information to send to the approved contract.
   */
  encodeApproveAndCallFunctionData(
    spender: ChainIdentifier,
    shares: bigint,
    extraData: Hex,
  ): Hex

  /**
   * Calculates the amount of tBTC that will be redeemed for the given amount
   * of stBTC shares.
   * @param shares Amount of stBTC shares to redeem.
   */
  previewRedeem(shares: bigint): Promise<bigint>

  /**
   * Converts the tBTC amount to stBTC shares.
   * @param amount Amount of tBTC.
   */
  convertToShares(amount: bigint): Promise<bigint>
}
