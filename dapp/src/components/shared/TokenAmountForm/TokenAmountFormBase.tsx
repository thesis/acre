import React from "react"
import { FormikProps, useField } from "formik"
import { CurrencyType } from "#/types"
import { Form, FormTokenBalanceInput } from "../Form"

const TOKEN_AMOUNT_FIELD_NAME = "amount"

export type TokenAmountFormValues = {
  [TOKEN_AMOUNT_FIELD_NAME]?: bigint | string
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
  return (
    <Form id={formId} onSubmit={formikProps.handleSubmit}>
      <FormTokenBalanceInput
        name={TOKEN_AMOUNT_FIELD_NAME}
        tokenBalance={tokenBalance}
        placeholder={tokenBalanceInputPlaceholder}
        currency={currency}
        withMaxButton={withMaxButton}
        defaultValue={defaultAmount}
        autoFocus
      />
      {children}
    </Form>
  )
}
