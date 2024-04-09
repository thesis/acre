import { RootState } from ".."

export const selectEstimatedBtcBalance = (state: RootState): bigint =>
  state.btc.estimatedBtcBalance

export const selectSharesBalance = (state: RootState): bigint =>
  state.btc.sharesBalance

export const selectBtcUsdPrice = (state: RootState): number =>
  state.btc.usdPrice

export const selectMinStakeAmount = (state: RootState) =>
  state.btc.minStakeAmount
