import { combineReducers } from "@reduxjs/toolkit"
import { btcSlice } from "./btc/btcSlice"
import { actionFlowSlice } from "./action-flow/actionFlowSlice"

export const reducer = combineReducers({
  btc: btcSlice.reducer,
  actionFlow: actionFlowSlice.reducer,
})
