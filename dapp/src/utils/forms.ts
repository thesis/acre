import { CurrencyType } from "#/types"
import { getCurrencyByType } from "./currency"
import { fixedPointNumberToString } from "./numbers"

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
  value: bigint | undefined,
  maxValue: bigint,
  minValue: bigint,
  currency: CurrencyType,
): string | undefined {
  if (value === undefined) return ERRORS.REQUIRED

  const { decimals } = getCurrencyByType(currency)

  const isMaximumValueExceeded = value > maxValue
  const isMinimumValueFulfilled = value >= minValue

  if (isMaximumValueExceeded) return ERRORS.EXCEEDED_VALUE
  if (!isMinimumValueFulfilled)
    return ERRORS.INSUFFICIENT_VALUE(
      fixedPointNumberToString(minValue, decimals),
    )

  return undefined
}
