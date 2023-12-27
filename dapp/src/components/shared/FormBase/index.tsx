import React from "react"
import { Button } from "@chakra-ui/react"
import { FormikProps } from "formik"
import { Form, FormTokenBalanceInput } from "../Form"
import { CurrencyType, TransactionType } from "../../../types"
import TransactionDetails from "./TransactionDetails"

export type FormValues = {
  amount: string
}

export type FormBaseProps = {
  transactionType: TransactionType
  btnText: string
  tokenBalance: string
  tokenBalanceInputPlaceholder?: string
  currencyType?: CurrencyType
  fieldName?: string
  children?: React.ReactNode
}

function FormBase({
  transactionType,
  btnText,
  tokenBalance,
  tokenBalanceInputPlaceholder = "BTC",
  currencyType = "bitcoin",
  fieldName = "amount",
  children,
  ...formikProps
}: FormBaseProps & FormikProps<FormValues>) {
  return (
    <Form onSubmit={formikProps.handleSubmit}>
      <FormTokenBalanceInput
        name={fieldName}
        tokenBalance={tokenBalance}
        placeholder={tokenBalanceInputPlaceholder}
        currencyType={currencyType}
      />
      <TransactionDetails fieldName={fieldName} type={transactionType} />
      {children}
      <Button type="submit" size="lg" width="100%" mt={4}>
        {btnText}
      </Button>
    </Form>
  )
}

export default FormBase
