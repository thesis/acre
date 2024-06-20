import { ActivitiesByIds, Activity } from "#/types"
import { isActivityCompleted } from "#/utils"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export type WalletState = {
  isSignedMessage: boolean
  latestActivities: ActivitiesByIds
  activities: Activity[]
}

const initialState: WalletState = {
  isSignedMessage: false,
  latestActivities: {},
  activities: [],
}

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
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
  },
})

export const { setIsSignedMessage, setActivities, deleteLatestActivity } =
  walletSlice.actions
export default walletSlice.reducer
