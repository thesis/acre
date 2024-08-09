import { ActivityType } from "#/types"

const MIN_LIMIT_VALUE = BigInt(String(1e7)) // 0.1 BTC
const MAX_LIMIT_VALUE = BigInt(String(1e8)) // 1 BTC

const isWithdraw = (type: ActivityType) => type === "withdraw"

function getEstimatedDuration(amount: bigint, type: ActivityType): string {
  if (isWithdraw(type)) return "6 hours"

  if (amount < MIN_LIMIT_VALUE) return "1 hours"

  if (amount >= MIN_LIMIT_VALUE && amount < MAX_LIMIT_VALUE) return "2 hours"

  return "3 hours"
}

function convertActivityTypeToLabel(type: ActivityType): string {
  if (isWithdraw(type)) return "Unstaking"

  return "Staking"
}

export default {
  getEstimatedDuration,
  convertActivityTypeToLabel,
}
