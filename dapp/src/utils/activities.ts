import { Activity } from "#/types"

export const isActivityCompleted = (activity: Activity): boolean =>
  activity.status === "completed"

export const sortActivitiesByTimestamp = (activities: Activity[]): Activity[] =>
  [...activities].sort(
    (activity1, activity2) => activity2.initializedAt - activity1.initializedAt,
  )

export const filterCompletedActivities = (activities: Activity[]): Activity[] =>
  activities.filter((activity) => isActivityCompleted(activity))
