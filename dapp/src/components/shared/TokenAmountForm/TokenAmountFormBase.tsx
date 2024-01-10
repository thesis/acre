import React from "react"
import { FormikProps, useField } from "formik"
import { Form, FormTokenBalanceInput } from "../Form"
import { CurrencyType } from "../../../types"

const TOKEN_AMOUNT_FIELD_NAME = "amount"

export type TokenAmountFormValues = {
  [TOKEN_AMOUNT_FIELD_NAME]?: bigint
}

export const useTokenAmountFormValue = () => {
  const [, { value }] = useField<
    TokenAmountFormValues[typeof TOKEN_AMOUNT_FIELD_NAME]
  >(TOKEN_AMOUNT_FIELD_NAME)

  return value
}

export type TokenAmountFormBaseProps = {
  formId?: string
  tokenBalance: string
  tokenBalanceInputPlaceholder: string
  currency: CurrencyType
  children?: React.ReactNode
}

export default function TokenAmountFormBase({
  formId,
  tokenBalance,
  currency,
  tokenBalanceInputPlaceholder,
  children,
  ...formikProps
}: TokenAmountFormBaseProps & FormikProps<TokenAmountFormValues>) {
  return (
    <Form id={formId} onSubmit={formikProps.handleSubmit}>
      <FormTokenBalanceInput
        name={TOKEN_AMOUNT_FIELD_NAME}
        tokenBalance={tokenBalance}
        placeholder={tokenBalanceInputPlaceholder}
        currency={currency}
      />
      {children}
    </Form>
  )
}
