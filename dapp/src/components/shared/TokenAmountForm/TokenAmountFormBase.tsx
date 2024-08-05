import React, { useEffect, useRef } from "react"
import { FormikProps, useField } from "formik"
import { CurrencyType } from "#/types"
import { Form, FormTokenBalanceInput } from "../Form"

const TOKEN_AMOUNT_FIELD_NAME = "amount"

export type TokenAmountFormValues = {
  [TOKEN_AMOUNT_FIELD_NAME]?: bigint
}

export const useTokenAmountField = () => {
  const [, { error, touched, value }] = useField<
    TokenAmountFormValues[typeof TOKEN_AMOUNT_FIELD_NAME]
  >(TOKEN_AMOUNT_FIELD_NAME)

  const hasError = !!error
  const isValid = !hasError && touched && value

  return { value, isValid }
}

export type TokenAmountFormBaseProps = {
  formId?: string
  tokenBalance: bigint
  tokenBalanceInputPlaceholder: string
  currency: CurrencyType
  withMaxButton: boolean
  children?: React.ReactNode
  defaultAmount?: bigint
}

export default function TokenAmountFormBase({
  formId,
  tokenBalance,
  currency,
  tokenBalanceInputPlaceholder,
  withMaxButton,
  children,
  defaultAmount,
  ...formikProps
}: TokenAmountFormBaseProps & FormikProps<TokenAmountFormValues>) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <Form id={formId} onSubmit={formikProps.handleSubmit}>
      <FormTokenBalanceInput
        ref={inputRef}
        name={TOKEN_AMOUNT_FIELD_NAME}
        tokenBalance={tokenBalance}
        placeholder={tokenBalanceInputPlaceholder}
        currency={currency}
        withMaxButton={withMaxButton}
        defaultValue={defaultAmount}
      />
      {children}
    </Form>
  )
}
