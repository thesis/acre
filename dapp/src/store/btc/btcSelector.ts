import { RootState } from ".."

export const selectBtcUsdPrice = (state: RootState): number =>
  state.btc.usdPrice

export const selectMinDepositAmount = (state: RootState) =>
  state.btc.minDepositAmount

export const selectTotalAssets = (state: RootState) => state.btc.totalAssets
