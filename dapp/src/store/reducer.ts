import { combineReducers } from "@reduxjs/toolkit"
import { btcSlice } from "./btc/btcSlice"

export const reducer = combineReducers({
  btc: btcSlice.reducer,
})
