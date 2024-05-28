import { createSelector } from "@reduxjs/toolkit"
import { isActivityCompleted } from "#/utils"
import { RootState } from ".."

export const selectLatestActivities = createSelector(
  (state: RootState) => state.wallet.latestActivities,
  (latestActivities) => Object.values(latestActivities),
)

export const selectCompletedActivities = createSelector(
  (state: RootState) => state.wallet.activities,
  (activities) =>
    activities.filter((activity) => isActivityCompleted(activity)),
)
