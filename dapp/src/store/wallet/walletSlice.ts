import { Activity } from "#/types"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export type WalletState = {
  estimatedBtcBalance: bigint
  sharesBalance: bigint
  isSignedMessage: boolean
  // Activities are saved in redux because the Acre subgraph may or may not be
  // up to date with the chain. As a result, if we fetch data from Acre SDK
  // after the withdrawal is initiated, we may not yet see this activity.
  // Storing activities in redux gives us the option to add activities manually
  // by `activityInitialized`. However, fetching the activity from the Acre SDK
  // again later should already return us the updated data.
  activities: Activity[]
  address: string | undefined
}

export const initialState: WalletState = {
  estimatedBtcBalance: 0n,
  sharesBalance: 0n,
  isSignedMessage: false,
  activities: [],
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
    setActivities(state, action: PayloadAction<Activity[]>) {
      state.activities = action.payload
    },
    resetState: (state) => ({ ...initialState, address: state.address }),
    activityInitialized(state, action: PayloadAction<Activity>) {
      const activity = action.payload
      state.activities = [...state.activities, activity]
    },
    setAddress(state, action: PayloadAction<string | undefined>) {
      state.address = action.payload
    },
  },
})

export const {
  setSharesBalance,
  setEstimatedBtcBalance,
  setIsSignedMessage,
  setActivities,
  resetState,
  activityInitialized,
  setAddress,
} = walletSlice.actions
export default walletSlice.reducer
