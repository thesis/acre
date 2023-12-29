import { BITCOIN_MIN_AMOUNT } from "../constants"
import { formatSatoshiAmount } from "./numbers"

const ERRORS = {
  REQUIRED: "Required.",
  EXCEEDED_VALUE: "The amount exceeds your current balance.",
  INSUFFICIENT_VALUE: (minValue: string) =>
    `The minimum amount must be at least ${minValue} BTC.`,
}

export function getErrorsObj<T>(errors: { [key in keyof T]: string }) {
  return (Object.keys(errors) as Array<keyof T>).every((name) => !errors[name])
    ? {}
    : errors
}

export function validateTokenAmount(
  value: string,
  tokenBalance: string,
): string | undefined {
  if (!value) return ERRORS.REQUIRED

  const valueInBI = BigInt(value)
  const maxValueInBI = BigInt(tokenBalance)
  const minValueInBI = BigInt(BITCOIN_MIN_AMOUNT)

  const isMaximumValueExceeded = valueInBI > maxValueInBI
  const isMinimumValueFulfilled = valueInBI >= minValueInBI

  if (isMaximumValueExceeded) return ERRORS.EXCEEDED_VALUE
  if (!isMinimumValueFulfilled)
    return ERRORS.INSUFFICIENT_VALUE(formatSatoshiAmount(BITCOIN_MIN_AMOUNT))

  return undefined
}
