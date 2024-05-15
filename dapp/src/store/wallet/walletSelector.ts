import { Activity } from "#/types"
import { RootState } from ".."

export const selectActivities = (state: RootState): Activity[] =>
  Object.values(state.wallet.activities)

export const selectActivitiesIds = (state: RootState): string[] =>
  Object.keys(state.wallet.activities)

export const selectTransactions = (state: RootState): Activity[] =>
  state.wallet.transactions
