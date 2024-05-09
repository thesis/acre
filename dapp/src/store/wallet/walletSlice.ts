import { Activity } from "#/types"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

type WalletState = {
  activities: Activity[]
}

const initialState: WalletState = {
  activities: [],
}

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setActivities(state, action: PayloadAction<Activity[]>) {
      state.activities = action.payload
    },
  },
})

export const { setActivities } = walletSlice.actions
