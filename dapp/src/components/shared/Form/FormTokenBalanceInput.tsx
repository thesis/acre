import React, { forwardRef, useCallback, useEffect } from "react"
import { useField } from "formik"
import { logPromiseFailure } from "#/utils"
import TokenBalanceInput, { TokenBalanceInputProps } from "../TokenBalanceInput"

export type FormTokenBalanceInputProps = {
  name: string
  defaultValue?: bigint
} & Omit<TokenBalanceInputProps, "setAmount" | "defaultValue">

export const FormTokenBalanceInput = forwardRef<
  HTMLInputElement,
  FormTokenBalanceInputProps
>((props, ref) => {
  const { name, defaultValue, ...restProps } = props

  const [field, meta, helpers] = useField(name)

  const setAmount = useCallback(
    (value?: bigint) => {
      if (!meta.touched) logPromiseFailure(helpers.setTouched(true))
      logPromiseFailure(helpers.setValue(value))
    },
    [helpers, meta.touched],
  )

  useEffect(() => {
    if (defaultValue) {
      setAmount(defaultValue)
    }
  }, [defaultValue, setAmount])

  return (
    <TokenBalanceInput
      ref={ref}
      {...restProps}
      {...field}
      amount={defaultValue ?? (meta.value as bigint)}
      setAmount={setAmount}
      hasError={Boolean(meta.touched && meta.error)}
      errorMsgText={meta.error}
    />
  )
})
