import { createSelector } from "@reduxjs/toolkit"
import { sortActivitiesByTimestamp } from "#/utils"
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

export const selectIsSignedMessage = (state: RootState): boolean =>
  state.wallet.isSignedMessage

export const selectWalletAddress = (state: RootState): string | undefined =>
  state.wallet.address
