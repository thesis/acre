const MIN_LIMIT_VALUE = BigInt(String(1e7)) // 0.1 BTC
const MAX_LIMIT_VALUE = BigInt(String(1e8)) // 1 BTC

function getEstimatedDuration(
  amount: bigint,
  type: "deposit" | "withdraw",
): string {
  if (type === "withdraw") return "6 hours"

  if (amount < MIN_LIMIT_VALUE) return "1 hours"

  if (amount >= MIN_LIMIT_VALUE && amount < MAX_LIMIT_VALUE) return "2 hours"

  return "3 hours"
}

function convertTypeToLabel(type: "deposit" | "withdraw"): string {
  if (type === "withdraw") return "Unstaking"

  return "Staking"
}

export default {
  getEstimatedDuration,
  convertTypeToLabel,
}
