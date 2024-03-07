import { RootState } from ".."

export const selectBtcUsdPrice = (state: RootState) => state.btc.usdPrice

export const selectMinDepositAmount = (state: RootState) =>
  state.btc.minDepositAmount
