import { ChainIdentifier } from "./chain-identifier"

export interface StBTC {
  /**
   * @returns The chain-specific identifier of this contract.
   */
  getAddress(): ChainIdentifier

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
   * Calculates the amount of tBTC that will be redeemed for the given amount
   * of stBTC shares.
   * @param amount Amount of stBTC shares to redeem.
   */
  previewRedeem(amount: bigint): Promise<bigint>

  encodeRedeemToBitcoinFunctionData(
    stbtcAmount: bigint,
    tbtcRedemptionData: string,
  ): string

  convertToShares(amount: bigint): Promise<bigint>
}
