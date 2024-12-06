import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export type WalletState = {
  estimatedBtcBalance: bigint
  sharesBalance: bigint
  isSignedMessage: boolean
  address: string | undefined
}

export const initialState: WalletState = {
  estimatedBtcBalance: 0n,
  sharesBalance: 0n,
  isSignedMessage: false,
  address: undefined,
}

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setSharesBalance(state, action: PayloadAction<bigint>) {
      state.sharesBalance = action.payload
    },
    setEstimatedBtcBalance(state, action: PayloadAction<bigint>) {
      state.estimatedBtcBalance = action.payload
    },
    setIsSignedMessage(state, action: PayloadAction<boolean>) {
      state.isSignedMessage = action.payload
    },
    resetState: (state) => ({ ...initialState, address: state.address }),
    setAddress(state, action: PayloadAction<string | undefined>) {
      state.address = action.payload
    },
  },
})

export const {
  setSharesBalance,
  setEstimatedBtcBalance,
  setIsSignedMessage,
  resetState,
  setAddress,
} = walletSlice.actions
export default walletSlice.reducer
