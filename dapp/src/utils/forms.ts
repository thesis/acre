import { CurrencyType } from "#/types"
import { getCurrencyByType } from "./currency"
import { fixedPointNumberToString } from "./numbers"

const ERRORS = {
  REQUIRED: "Please enter an amount.",
  EXCEEDED_VALUE:
    "The amount exceeds your current wallet balance. Add more funds to your wallet or lower the deposit amount.",
  INSUFFICIENT_VALUE: (minValue: string) =>
    `The amount is below the minimum required deposit of ${minValue} BTC.`,
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
