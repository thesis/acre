import {
  ACTION_FORM_ERRORS,
  PASSWORD_FORM_ERRORS,
  TOKEN_FORM_ERRORS,
} from "#/constants"
import sentry from "#/sentry"
import { ACTION_FLOW_TYPES, ActionFlowType, CurrencyType } from "#/types"
import acreApi from "./acreApi"
import { getCurrencyByType } from "./currency"
import { fixedPointNumberToString } from "./numbers"

export function getErrorsObj<T>(errors: { [key in keyof T]: string }) {
  return (Object.keys(errors) as Array<keyof T>).every((name) => !errors[name])
    ? {}
    : errors
}

export async function validatePassword(
  value: string | undefined,
): Promise<string | undefined> {
  if (value === undefined || value === "") return PASSWORD_FORM_ERRORS.REQUIRED

  try {
    const encodedCode = window.btoa(value)
    const isValid = await acreApi.verifyAccessCode(encodedCode)
    if (!isValid) return PASSWORD_FORM_ERRORS.INCORRECT_VALUE
  } catch (error) {
    sentry.captureException(error)
    console.error(error)
    return PASSWORD_FORM_ERRORS.DEFAULT
  }

  return undefined
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
      actionType === ACTION_FLOW_TYPES.STAKE ? "deposit" : "withdrawal",
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
