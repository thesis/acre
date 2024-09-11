import { ACTION_FORM_ERRORS, TOKEN_FORM_ERRORS } from "#/constants"
import { ActionFlowType, CurrencyType } from "#/types"
import { getCurrencyByType } from "./currency"
import { fixedPointNumberToString } from "./numbers"

export function getErrorsObj<T>(errors: { [key in keyof T]: string }) {
  return (Object.keys(errors) as Array<keyof T>).every((name) => !errors[name])
    ? {}
    : errors
}

export function validateTokenAmount(
  actionType: ActionFlowType,
  value: bigint | undefined,
  maxValue: bigint,
  minValue: bigint,
  currency: CurrencyType,
): string | undefined {
  const ERRORS_BY_ACTION_TYPE = ACTION_FORM_ERRORS[actionType]

  if (value === undefined) return ERRORS_BY_ACTION_TYPE.REQUIRED

  const { decimals } = getCurrencyByType(currency)

  const isMaximumValueExceeded = value > maxValue
  const isMinimumValueFulfilled = value >= minValue

  if (isMaximumValueExceeded) return ERRORS_BY_ACTION_TYPE.EXCEEDED_VALUE
  if (!isMinimumValueFulfilled)
    return ERRORS_BY_ACTION_TYPE.INSUFFICIENT_VALUE(
      fixedPointNumberToString(minValue, decimals),
    )

  return undefined
}

type ParametrizedError = (value: number) => string
export const isFormError = (
  type: keyof typeof TOKEN_FORM_ERRORS,
  message: string,
) => {
  let errorPredicates = [
    ACTION_FORM_ERRORS.STAKE[type],
    ACTION_FORM_ERRORS.UNSTAKE[type],
  ]

  const isParametrizedError = errorPredicates.every(
    (predicate) => typeof predicate === "function",
  )

  if (isParametrizedError) {
    const errorParameter = (message.match(/\d*\.\d+|\d+/g) ?? []).map(
      parseFloat,
    )[0]

    // Already checked that all predicates are functions
    errorPredicates = (errorPredicates as unknown as ParametrizedError[]).map(
      (predicate) => predicate(errorParameter),
    )
  }

  return errorPredicates.includes(message)
}
