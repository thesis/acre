import React from "react"
import { FormikProps } from "formik"
import { Form, FormTokenBalanceInput } from "../Form"
import { Currency } from "../../../types"
import { TOKEN_AMOUNT_FIELD_NAME } from "../../../constants"

export type TokenAmountFormValues = {
  [TOKEN_AMOUNT_FIELD_NAME]?: bigint
}

export type TokenAmountFormBaseProps = {
  formId?: string
  tokenBalance: string
  tokenBalanceInputPlaceholder: string
  currency: Currency
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
