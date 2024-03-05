import { RootState } from ".."

export const selectEstimatedBtcBalance = (state: RootState) =>
  state.btc.estimatedBtcBalance
export const selectSharesBalance = (state: RootState) => state.btc.sharesBalance
export const selectBtcUsdPrice = (state: RootState) => state.btc.usdPrice
