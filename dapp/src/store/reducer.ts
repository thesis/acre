import { combineReducers } from "@reduxjs/toolkit"
import { btcSlice } from "./btc/btcSlice"
import { walletSlice } from "./wallet/walletSlice"
import { actionFlowSlice } from "./action-flow/actionFlowSlice"
import { modalSlice } from "./modal/modalSlice"

export const reducer = combineReducers({
  btc: btcSlice.reducer,
  wallet: walletSlice.reducer,
  actionFlow: actionFlowSlice.reducer,
  modal: modalSlice.reducer,
})
