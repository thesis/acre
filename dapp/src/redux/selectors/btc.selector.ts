import { RootState } from "#/types"

export const selectBtcUsdPrice = (state: RootState) => state.btcReducer.usdPrice
