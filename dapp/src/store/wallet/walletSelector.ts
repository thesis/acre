import { Activity } from "#/types"
import { createSelector } from "@reduxjs/toolkit"
import { RootState } from ".."

export const selectActivities = (state: RootState): Activity[] =>
  state.wallet.activities

export const selectCompletedActivities = createSelector(
  [selectActivities],
  (activities) => activities.filter(({ status }) => status === "completed"),
)
