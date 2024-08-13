import { Activity } from "#/types"

export const isActivityCompleted = (activity: Activity): boolean =>
  activity.status === "completed"

export const getActivityTimestamp = (activity: Activity): number =>
  activity?.finalizedAt ?? activity.initializedAt

export const sortActivitiesByTimestamp = (activities: Activity[]): Activity[] =>
  [...activities].sort(
    (activity1, activity2) =>
      getActivityTimestamp(activity2) - getActivityTimestamp(activity1),
  )

export const filterCompletedActivities = (activities: Activity[]): Activity[] =>
  activities.filter((activity) => isActivityCompleted(activity))
