import React from "react"
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

  const setAmount = (value?: bigint) => {
    logPromiseFailure(helpers.setValue(value))
  }

  return (
    <TokenBalanceInput
      {...restProps}
      {...field}
      amount={meta.value as bigint}
      setAmount={setAmount}
      hasError={Boolean(meta.touched && meta.error)}
      errorMsgText={meta.error}
    />
  )
}
