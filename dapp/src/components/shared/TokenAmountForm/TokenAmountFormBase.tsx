import React from "react"
import { FormikProps } from "formik"
import { Form, FormTokenBalanceInput } from "../Form"
import { Currency } from "../../../types"

export type TokenAmountFormValues = {
  amount?: bigint
}

export type TokenAmountFormBaseProps = {
  formId: string
  tokenBalance: string
  tokenBalanceInputPlaceholder: string
  currency: Currency
  fieldName: string
  children?: React.ReactNode
}

export default function TokenAmountFormBase({
  formId,
  tokenBalance,
  currency,
  tokenBalanceInputPlaceholder,
  fieldName,
  children,
  ...formikProps
}: TokenAmountFormBaseProps & FormikProps<TokenAmountFormValues>) {
  return (
    <Form id={formId} onSubmit={formikProps.handleSubmit}>
      <FormTokenBalanceInput
        name={fieldName}
        tokenBalance={tokenBalance}
        placeholder={tokenBalanceInputPlaceholder}
        currency={currency}
      />
      {children}
    </Form>
  )
}
