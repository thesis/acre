import { Activity, ActivityType } from "#/types"

const MIN_LIMIT_VALUE_DURATION = BigInt(String(1e7)) // 0.1 BTC
const MAX_LIMIT_VALUE_DURATION = BigInt(String(1e8)) // 1 BTC

export const isActivityCompleted = (activity: Activity): boolean =>
  activity.status === "completed"

export const getActivityTimestamp = (activity: Activity): number =>
  activity?.finalizedAt ?? activity.initializedAt

export const sortActivitiesByTimestamp = (activities: Activity[]): Activity[] =>
  [...activities].sort(
    (activity1, activity2) =>
      getActivityTimestamp(activity2) - getActivityTimestamp(activity1),
  )

export const isWithdrawType = (type: ActivityType) => type === "withdraw"

export function getEstimatedDuration(
  amount: bigint,
  type: ActivityType,
): string {
  if (isWithdrawType(type)) return "6 hours"

  if (amount < MIN_LIMIT_VALUE_DURATION) return "1 hour"

  if (amount >= MIN_LIMIT_VALUE_DURATION && amount < MAX_LIMIT_VALUE_DURATION)
    return "2 hours"

  return "3 hours"
}

export function convertActivityTypeToLabel(type: ActivityType): string {
  if (isWithdrawType(type)) return "Unstaking"

  return "Staking"
}
