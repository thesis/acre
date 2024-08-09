import { createSelector } from "@reduxjs/toolkit"
import { filterCompletedActivities, sortActivitiesByTimestamp } from "#/utils"
import { RootState } from ".."

export const selectEstimatedBtcBalance = (state: RootState): bigint =>
  state.wallet.estimatedBtcBalance

export const selectSharesBalance = (state: RootState): bigint =>
  state.wallet.sharesBalance

export const selectActivities = createSelector(
  (state: RootState) => state.wallet.activities,
  (activities) => sortActivitiesByTimestamp(activities),
)

export const selectAllActivitiesCount = createSelector(
  (state: RootState) => state.wallet.activities,
  (activities) => activities.length,
)

export const selectLatestActivities = createSelector(
  (state: RootState) => state.wallet.latestActivities,
  (latestActivities) =>
    sortActivitiesByTimestamp(Object.values(latestActivities)),
)

export const selectLatestCompletedActivities = createSelector(
  selectLatestActivities,
  (latestActivities) => filterCompletedActivities(latestActivities),
)

export const selectCompletedActivities = createSelector(
  selectActivities,
  (activities) => filterCompletedActivities(activities),
)

export const selectIsSignedMessage = (state: RootState): boolean =>
  state.wallet.isSignedMessage

export const selectHasFetchedActivities = (state: RootState): boolean =>
  state.wallet.hasFetchedActivities
