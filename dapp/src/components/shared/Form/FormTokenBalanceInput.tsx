import React, { useEffect } from "react"
import { useFormField } from "#/hooks"
import TokenBalanceInput, { TokenBalanceInputProps } from "../TokenBalanceInput"

export type FormTokenBalanceInputProps = {
  name: string
  defaultValue?: bigint
} & Omit<TokenBalanceInputProps, "setAmount" | "defaultValue">

export function FormTokenBalanceInput({
  name,
  defaultValue,
  ...restProps
}: FormTokenBalanceInputProps) {
  const { field, value, errorMsgText, hasError, onChange } = useFormField<
    bigint | undefined
  >(name)

  useEffect(() => {
    if (defaultValue) {
      onChange(defaultValue)
    }
  }, [defaultValue, onChange])

  return (
    <TokenBalanceInput
      {...restProps}
      {...field}
      amount={defaultValue ?? value}
      setAmount={onChange}
      hasError={hasError}
      errorMsgText={errorMsgText}
    />
  )
}
