import React, { useCallback } from "react"
import { useField } from "formik"
import { logPromiseFailure } from "#/utils"
import TokenBalanceInput, { TokenBalanceInputProps } from "../TokenBalanceInput"

export type FormTokenBalanceInputProps = {
  name: string
} & Omit<TokenBalanceInputProps, "setAmount">

export function FormTokenBalanceInput({
  name,
  ...restProps
}: FormTokenBalanceInputProps) {
  const [field, meta, helpers] = useField(name)

  const setAmount = useCallback(
    (value?: bigint) => {
      if (!meta.touched) logPromiseFailure(helpers.setTouched(true))
      if (meta.error) helpers.setError(undefined)

      logPromiseFailure(helpers.setValue(value))
    },
    [helpers, meta.touched, meta.error],
  )

  return (
    <TokenBalanceInput
      {...restProps}
      {...field}
      amount={meta.value as bigint}
      setAmount={setAmount}
      hasError={Boolean(meta.error)}
      errorMsgText={meta.error}
    />
  )
}
