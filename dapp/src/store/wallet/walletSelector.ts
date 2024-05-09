import { Activity } from "#/types"
import { RootState } from ".."

export const selectActivities = (state: RootState): Activity[] =>
  state.wallet.activities
