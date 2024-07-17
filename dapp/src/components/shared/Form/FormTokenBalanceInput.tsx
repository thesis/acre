import React, { useCallback, useEffect } from "react"
import { useField } from "formik"
import { logPromiseFailure } from "#/utils"
import TokenBalanceInput, { TokenBalanceInputProps } from "../TokenBalanceInput"

export type FormTokenBalanceInputProps = {
  name: string
  defaultValue?: bigint
} & Omit<TokenBalanceInputProps, "setAmount" | "defaultValue">
export function FormTokenBalanceInput({
  name,
  defaultValue,
  currency,
  ...restProps
}: FormTokenBalanceInputProps) {
  const [field, meta, helpers] = useField(name)

  const setAmount = useCallback(
    (value?: bigint) => {
      logPromiseFailure(helpers.setValue(value))
    },
    [helpers],
  )

  useEffect(() => {
    if (defaultValue) {
      setAmount(defaultValue)
    }
  }, [defaultValue, setAmount])

  return (
    <TokenBalanceInput
      {...restProps}
      {...field}
      amount={defaultValue ?? (meta.value as bigint)}
      setAmount={setAmount}
      hasError={Boolean(meta.touched && meta.error)}
      errorMsgText={meta.error}
      decimalScale={decimals}
    />
  )
}
