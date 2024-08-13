import { ACTION_FORM_ERRORS, TOKEN_FORM_ERRORS } from "#/constants"
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

type GetTokenAmountErrorKeyReturnType = keyof typeof TOKEN_FORM_ERRORS | null
export const getTokenAmountErrorKey = (
  errorMessage: string,
): GetTokenAmountErrorKeyReturnType => {
  const errorKeys = Object.keys(ACTION_FORM_ERRORS)
  const errorKeyValuePairs = [
    ...new Set([
      ...Object.entries(ACTION_FORM_ERRORS[ACTION_FLOW_TYPES.STAKE]),
      ...Object.entries(ACTION_FORM_ERRORS[ACTION_FLOW_TYPES.UNSTAKE]),
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
