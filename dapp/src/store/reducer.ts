import { combineReducers } from "@reduxjs/toolkit"
import { btcSlice } from "./btc/btc.slice"

export const reducer = combineReducers({
  btc: btcSlice.reducer,
})
