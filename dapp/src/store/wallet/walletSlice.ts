import { ActivitiesByIds, Activity } from "#/types"
import { isActivityCompleted } from "#/utils"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export type WalletState = {
  estimatedBtcBalance: bigint
  sharesBalance: bigint
  isSignedMessage: boolean
  latestActivities: ActivitiesByIds
  activities: Activity[]
}

const initialState: WalletState = {
  estimatedBtcBalance: 0n,
  sharesBalance: 0n,
  isSignedMessage: false,
  latestActivities: {},
  activities: [],
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
      const allActivities = action.payload

      const pendingActivities = allActivities.reduce<[string, Activity][]>(
        (acc, activity) => {
          if (!isActivityCompleted(activity)) acc.push([activity.id, activity])

          return acc
        },
        [],
      )
      const pendingActivitiesByIds = Object.fromEntries(pendingActivities)
      const pendingActivitiesIds = Object.keys(pendingActivities)

      const { latestActivities } = state
      const updatedActivitiesByIds = Object.values(
        latestActivities,
      ).reduce<ActivitiesByIds>((acc, activity) => {
        if (!pendingActivitiesIds.includes(activity.id))
          acc[activity.id] = { ...activity, status: "completed" }

        return acc
      }, {})

      state.activities = allActivities
      state.latestActivities = Object.assign(
        updatedActivitiesByIds,
        pendingActivitiesByIds,
      )
    },
    deleteLatestActivity(state, action: PayloadAction<string>) {
      const activityId = action.payload
      delete state.latestActivities[activityId]
    },
    resetState: () => initialState,
  },
})

export const {
  setSharesBalance,
  setEstimatedBtcBalance,
  setIsSignedMessage,
  setActivities,
  deleteLatestActivity,
  resetState,
} = walletSlice.actions
export default walletSlice.reducer
