import { Activity } from "#/types"

export const isActivityCompleted = (activity: Activity): boolean =>
  activity.status === "completed"
