import { createSelector } from "@reduxjs/toolkit"
import { isActivityCompleted, sortActivitiesByTimestamp } from "#/utils"
import { RootState } from ".."

export const selectLatestActivities = createSelector(
  (state: RootState) => state.wallet.latestActivities,
  (latestActivities) =>
    sortActivitiesByTimestamp(Object.values(latestActivities)),
)

export const selectCompletedActivities = createSelector(
  (state: RootState) => state.wallet.activities,
  (activities) =>
    sortActivitiesByTimestamp(
      activities.filter((activity) => isActivityCompleted(activity)),
    ),
)

export const selectAllActivitiesCount = createSelector(
  (state: RootState) => state.wallet.activities,
  (activities) => activities.length,
)
