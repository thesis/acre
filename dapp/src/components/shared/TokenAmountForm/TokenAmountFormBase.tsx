import React from "react"
import { FormikProps, useField } from "formik"
import { CurrencyType } from "#/types"
import { Form, FormTokenBalanceInput } from "../Form"

const TOKEN_AMOUNT_FIELD_NAME = "amount"

export type TokenAmountFormValues = {
  [TOKEN_AMOUNT_FIELD_NAME]?: bigint
}

export const useTokenAmountFormMeta = () => {
  const [, meta] = useField<
    TokenAmountFormValues[typeof TOKEN_AMOUNT_FIELD_NAME]
  >(TOKEN_AMOUNT_FIELD_NAME)

  return meta
}

export type TokenAmountFormBaseProps = {
  formId?: string
  tokenBalance: bigint
  tokenBalanceInputPlaceholder: string
  currency: CurrencyType
  fiatCurrency?: CurrencyType
  children?: React.ReactNode
}

export default function TokenAmountFormBase({
  formId,
  tokenBalance,
  currency,
  fiatCurrency,
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
        fiatCurrency={fiatCurrency}
      />
      {children}
    </Form>
  )
}
