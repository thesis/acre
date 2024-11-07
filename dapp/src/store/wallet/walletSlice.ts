import { ActivitiesByIds, Activity } from "#/types"
import { isActivityCompleted } from "#/utils"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export type WalletState = {
  estimatedBtcBalance: bigint
  sharesBalance: bigint
  isSignedMessage: boolean
  latestActivities: ActivitiesByIds
  activities: Activity[]
  hasFetchedActivities: boolean
  address: string | undefined
}

export const initialState: WalletState = {
  estimatedBtcBalance: 0n,
  sharesBalance: 0n,
  isSignedMessage: false,
  latestActivities: {},
  activities: [],
  hasFetchedActivities: false,
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

      const completedActivitiesByIds = Object.values(
        latestActivities,
      ).reduce<ActivitiesByIds>((acc, latestActivity) => {
        if (
          latestActivity.type === "deposit" &&
          !pendingActivitiesIds.includes(latestActivity.id)
        ) {
          acc[latestActivity.id] = { ...latestActivity, status: "completed" }
          return acc
        }

        const pendingActivityIdWithSameRedemptionKey =
          pendingActivitiesIds.find((id) => latestActivity.id.includes(id))

        const completedWithdrawalsWithSameRedemptionKey = allActivities
          .filter(
            (activity) =>
              activity.id.includes(latestActivity.id) &&
              isActivityCompleted(activity),
          )
          .sort((first, second) => {
            // The withdraw id is: `<redemptionKey>-<count>`
            const [, firstCount] = first.id.split("-")
            const [, secondCount] = second.id.split("-")

            return Number(secondCount) - Number(firstCount)
          })

        const latestCompletedWithdraw =
          completedWithdrawalsWithSameRedemptionKey[0]

        if (
          !pendingActivityIdWithSameRedemptionKey &&
          latestCompletedWithdraw
        ) {
          acc[latestCompletedWithdraw.id] = latestCompletedWithdraw
        }

        return acc
      }, {})

      state.activities = allActivities
      state.latestActivities = Object.assign(
        completedActivitiesByIds,
        pendingActivitiesByIds,
      )
      state.hasFetchedActivities = true
    },
    deleteLatestActivity(state, action: PayloadAction<string>) {
      const activityId = action.payload
      delete state.latestActivities[activityId]
    },
    resetState: (state) => ({ ...initialState, address: state.address }),
    activityInitialized(state, action: PayloadAction<Activity>) {
      const activity = action.payload
      state.latestActivities = {
        ...state.latestActivities,
        [activity.id]: activity,
      }
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
  deleteLatestActivity,
  resetState,
  activityInitialized,
  setAddress,
} = walletSlice.actions
export default walletSlice.reducer
