import { Activity, ActivityType, WithdrawalDestination } from "#/types"

const MIN_LIMIT_VALUE_DURATION = BigInt(String(1e7)) // 0.1 BTC
const MAX_LIMIT_VALUE_DURATION = BigInt(String(1e8)) // 1 BTC

const isActivityCompleted = (activity: Activity): boolean =>
  activity.status === "completed"

const isActivityMigrated = (activity: Activity): boolean =>
  activity.status === "migrated"

const getActivityTimestamp = (activity: Activity): number =>
  activity?.finalizedAt ?? activity.initializedAt

const hasPendingDeposits = (activities: Activity[]): boolean =>
  activities.some(
    (activity) => activity.status === "pending" && activity.type === "deposit",
  )

const sortActivitiesByTimestamp = (activities: Activity[]): Activity[] =>
  [...activities].sort(
    (activity1, activity2) =>
      getActivityTimestamp(activity2) - getActivityTimestamp(activity1),
  )

const isWithdrawType = (type: ActivityType) => type === "withdraw"

function getEstimatedDuration(
  amount: bigint,
  type: ActivityType,
  shouldUseShortenTimeUnitSuffix = false,
  withdrawalDestination: WithdrawalDestination["type"] = "bitcoin",
): string {
  const hoursSuffix = shouldUseShortenTimeUnitSuffix ? "h" : " hours"
  const minutesSuffix = shouldUseShortenTimeUnitSuffix ? "m" : " minutes"

  // This no longer varies by status: a withdrawal used to wait in the Midas
  // queue for the next NAV update before redemption started, which is what the
  // longer `requested` estimate accounted for. Funds now sit on the acreBTC
  // contract, so neither destination waits on the queue.
  if (isWithdrawType(type)) {
    // Paid out in tBTC by `acreBTC.redeem`, which settles in the very
    // transaction that requests it - no bridge, no queue. The only wait is
    // the Ethereum transaction being mined.
    if (withdrawalDestination === "tbtc") return `5${minutesSuffix}`

    // Bridged to Bitcoin through the tBTC redemption process, which takes
    // approximately 5 - 7 hours. We use the average value of 6 hours.
    return `6${hoursSuffix}`
  }

  // Deposit duration is related to the tBTC minting process, which varies based
  // on the amount of BTC deposited.
  // Each threshold requires a different number of Bitcoin transaction confirmations:
  // <0.1 BTC: 1 Bitcoin block confirmation (~10 minutes),
  // >=0.1 BTC and <1 BTC: 3 Bitcoin block confirmations (~30 minutes),
  // >=1 BTC: 6 Bitcoin block confirmations (~60 minutes).
  // The duration of the transaction minting process depends on the Bitcoin network
  // congestion, and the fee paid by the user.
  //
  // After the required number of Bitcoin block confirmations, the tBTC optimistic
  // minting process starts. The optimistic minting process takes approximately
  // 1 hour to complete.
  // After optimistic minting is completed, the Acre bots will finalize the deposit
  // in no more than 10 minutes.
  //
  // We round the estimated duration up to the nearest hour.
  //
  // For <0.1 BTC estimated duration is around 1 hour 20 minutes.
  if (amount < MIN_LIMIT_VALUE_DURATION) return `2${hoursSuffix}`
  // For <1 BTC estimated duration is around 1 hours 40 minutes.
  if (amount < MAX_LIMIT_VALUE_DURATION) return `2${hoursSuffix}`
  // For >=1 BTC estimated duration is around 2 hours 10 minutes.
  return `3${hoursSuffix}`
}

export default {
  isActivityCompleted,
  isActivityMigrated,
  getActivityTimestamp,
  hasPendingDeposits,
  sortActivitiesByTimestamp,
  isWithdrawType,
  getEstimatedDuration,
}
