import { ActivitiesByIds, Activity } from "#/types"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

type WalletState = {
  activities: ActivitiesByIds
  transactions: Activity[]
}

const initialState: WalletState = {
  activities: {},
  transactions: [],
}

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<Activity[]>) {
      state.transactions = action.payload
    },
    setActivities(state, action: PayloadAction<Activity[]>) {
      const newActivitiesByIds = Object.fromEntries(
        action.payload.map((activity) => [activity.id, activity]),
      )
      const newActivitiesIds = new Set(Object.keys(newActivitiesByIds))

      const updatedActivitiesByIds = Object.values(
        state.activities,
      ).reduce<ActivitiesByIds>((acc, activity) => {
        if (!newActivitiesIds.has(activity.id)) {
          acc[activity.id] = { ...activity, status: "completed" }
        }
        return acc
      }, {})

      state.activities = Object.assign(
        updatedActivitiesByIds,
        newActivitiesByIds,
      )
    },
    deleteActivity(state, action: PayloadAction<string>) {
      const activityId = action.payload
      delete state.activities[activityId]
    },
  },
})

export const { setTransactions, setActivities, deleteActivity } =
  walletSlice.actions
