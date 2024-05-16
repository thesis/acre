import { createSelector } from "@reduxjs/toolkit"
import { RootState } from ".."

export const selectActivities = createSelector(
  (state: RootState) => state.wallet.activities,
  // TODO: Temporary solution - Activities should be sorted from the latest.
  // Let's now display the list so that the latest activity is at the top
  // Ultimately, activities will be sorted by timestamp
  (activities) => [...activities].reverse(),
)
