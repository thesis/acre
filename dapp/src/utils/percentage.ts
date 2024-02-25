import { FixedNumber } from "ethers"

export const calculatePercentage = (
  amount: string | number,
  totalAmount: string | number,
): number => {
  if (!amount || !totalAmount) return 0

  return FixedNumber.fromString(amount.toString())
    .divUnsafe(FixedNumber.fromString(totalAmount.toString()))
    .mulUnsafe(FixedNumber.fromString("100"))
    .toUnsafeFloat()
}
export const formatPercentage = (
  percentage: number,
  desiredDecimals = 2,
  displayLessThanGreaterThanSigns = false,
  displaySign = true,
): string => {
  if (percentage < 1 && percentage > 0 && displayLessThanGreaterThanSigns) {
    return `<1${displaySign ? "%" : ""}`
  }
  if (percentage > 99 && percentage < 100 && displayLessThanGreaterThanSigns) {
    return `>99${displaySign ? "%" : ""}`
  }

  const roundedPercentage = percentage.toFixed(desiredDecimals)

  return `${roundedPercentage.toString()}${displaySign ? "%" : ""}`
}
