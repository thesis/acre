import { STAKE_FORM_ERRORS, UNSTAKE_FORM_ERRORS } from "#/constants"
import { ACTION_FLOW_TYPES, ActionFlowType, CurrencyType } from "#/types"
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
  const TOKEN_FORM_ERRORS =
    actionType === ACTION_FLOW_TYPES.STAKE
      ? STAKE_FORM_ERRORS
      : UNSTAKE_FORM_ERRORS

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

type GetTokenAmountErrorKeyReturnType = keyof typeof STAKE_FORM_ERRORS | null
export const getTokenAmountErrorKey = (
  errorMessage: string,
): GetTokenAmountErrorKeyReturnType => {
  const errorKeys = Object.keys(STAKE_FORM_ERRORS)
  const errorKeyValuePairs = [
    ...new Set([
      ...Object.entries(STAKE_FORM_ERRORS),
      ...Object.entries(UNSTAKE_FORM_ERRORS),
    ]),
  ]
  const errorKey =
    errorKeys.find((key) => {
      const errorValue = errorKeyValuePairs.find(
        ([_, value]) => value === errorMessage,
      )
      return errorValue && errorValue[0] === key
    }) ?? null

  return errorKey as GetTokenAmountErrorKeyReturnType
}
