import { TOKEN_FORM_ERRORS } from "#/constants"
import { CurrencyType } from "#/types"
import { getCurrencyByType } from "./currency"
import { fixedPointNumberToString } from "./numbers"

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
  if (value === undefined) return TOKEN_FORM_ERRORS.REQUIRED

  const { decimals } = getCurrencyByType(currency)

  const isMaximumValueExceeded = value > maxValue
  const isMinimumValueFulfilled = value >= minValue

  if (isMaximumValueExceeded) return TOKEN_FORM_ERRORS.EXCEEDED_VALUE
  if (!isMinimumValueFulfilled)
    return TOKEN_FORM_ERRORS.INSUFFICIENT_VALUE(
      fixedPointNumberToString(minValue, decimals),
    )

  return undefined
}
