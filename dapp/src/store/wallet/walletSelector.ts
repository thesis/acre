import { Activity } from "#/types"
import { createSelector } from "@reduxjs/toolkit"
import { RootState } from ".."

export const selectActivities = createSelector(
  (state: RootState) => state.wallet.activities,
  (activities) => Object.values(activities),
)

export const selectTransactions = (state: RootState): Activity[] =>
  state.wallet.transactions
