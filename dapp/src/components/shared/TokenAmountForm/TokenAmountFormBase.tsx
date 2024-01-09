import React from "react"
import { FormikProps } from "formik"
import { Form, FormTokenBalanceInput } from "../Form"
import { CurrencyType } from "../../../types"

export type TokenAmountFormValues = {
  amount?: bigint
}

export type TokenAmountFormBaseProps = {
  formId: string
  tokenBalance: string
  tokenBalanceInputPlaceholder: string
  currencyType: CurrencyType
  fieldName: string
  children?: React.ReactNode
}

export default function TokenAmountFormBase({
  formId,
  tokenBalance,
  currencyType,
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
        currencyType={currencyType}
      />
      {children}
    </Form>
  )
}
