import React from "react"
import { Button } from "@chakra-ui/react"
import { FormikProps, FormikErrors, withFormik } from "formik"
import { Form, FormTokenBalanceInput } from "../Form"
import { CurrencyType } from "../../../types"
import TransactionDetails from "./TransactionDetails"
import { getErrorsObj, validateTokenAmount } from "../../../utils"

export type TokenAmountFormValues = {
  amount?: bigint
}
type TokenAmountFormBaseProps = {
  customData: {
    buttonText: string
    btcAmountText: string
    estimatedAmountText: string
  }
  tokenBalance: string
  tokenBalanceInputPlaceholder?: string
  currencyType: CurrencyType
  fieldName?: string
  children?: React.ReactNode
}

function TokenAmountFormBase({
  customData,
  tokenBalance,
  currencyType,
  tokenBalanceInputPlaceholder = "BTC",
  fieldName = "amount",
  children,
  ...formikProps
}: TokenAmountFormBaseProps & FormikProps<TokenAmountFormValues>) {
  return (
    <Form onSubmit={formikProps.handleSubmit}>
      <FormTokenBalanceInput
        name={fieldName}
        tokenBalance={tokenBalance}
        placeholder={tokenBalanceInputPlaceholder}
        currencyType={currencyType}
      />
      <TransactionDetails
        fieldName={fieldName}
        btcAmountText={customData.btcAmountText}
        estimatedAmountText={customData.estimatedAmountText}
      />
      {children}
      <Button type="submit" size="lg" width="100%" mt={4}>
        {customData.buttonText}
      </Button>
    </Form>
  )
}

type TokenAmountFormProps = {
  onSubmitForm: (values: TokenAmountFormValues) => void
  minTokenAmount: string
} & TokenAmountFormBaseProps

const TokenAmountForm = withFormik<TokenAmountFormProps, TokenAmountFormValues>(
  {
    mapPropsToValues: () => ({
      amount: undefined,
    }),
    validate: async (
      { amount },
      { tokenBalance, currencyType, minTokenAmount },
    ) => {
      const errors: FormikErrors<TokenAmountFormValues> = {}

      errors.amount = validateTokenAmount(
        amount,
        tokenBalance,
        minTokenAmount,
        currencyType,
      )

      return getErrorsObj(errors)
    },
    handleSubmit: (values, { props }) => {
      props.onSubmitForm(values)
    },
  },
)(TokenAmountFormBase)

export default TokenAmountForm
