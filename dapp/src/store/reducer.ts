import { combineReducers } from "@reduxjs/toolkit"
import { btcSlice } from "./btc/btcSlice"
import { walletSlice } from "./wallet/walletSlice"

export const reducer = combineReducers({
  btc: btcSlice.reducer,
  wallet: walletSlice.reducer,
})
