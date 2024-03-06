import { FixedNumber } from "ethers"

export const calculatePercentage = (
  amount: string | number | bigint,
  totalAmount: string | number | bigint,
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
  shouldDisplayLessThanGreaterThanSigns = false,
  shouldDisplayPercentageSign = true,
): string => {
  if (
    percentage < 1 &&
    percentage > 0 &&
    shouldDisplayLessThanGreaterThanSigns
  ) {
    return `<1${shouldDisplayPercentageSign ? "%" : ""}`
  }

  if (
    percentage > 99 &&
    percentage < 100 &&
    shouldDisplayLessThanGreaterThanSigns
  ) {
    return `>99${shouldDisplayPercentageSign ? "%" : ""}`
  }

  const roundedPercentage = percentage.toFixed(desiredDecimals)

  return `${roundedPercentage.toString()}${
    shouldDisplayPercentageSign ? "%" : ""
  }`
}
