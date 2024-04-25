import { DepositFee } from "#/types"
import { RootState } from ".."

export const selectEstimatedBtcBalance = (state: RootState): bigint =>
  state.btc.estimatedBtcBalance

export const selectSharesBalance = (state: RootState): bigint =>
  state.btc.sharesBalance

export const selectEstimatedDepositFee = (state: RootState): DepositFee =>
  state.btc.estimateDepositFee

export const selectBtcUsdPrice = (state: RootState): number =>
  state.btc.usdPrice

export const selectMinDepositAmount = (state: RootState) =>
  state.btc.minDepositAmount
