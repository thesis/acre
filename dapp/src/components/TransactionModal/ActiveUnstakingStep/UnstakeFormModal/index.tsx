import React from "react"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { FormSubmitButton } from "#/components/shared/Form"
import { BaseFormProps } from "#/types"
import { useEstimatedBTCBalance, useMinDepositAmount } from "#/hooks"
import UnstakeDetails from "./UnstakeDetails"

function UnstakeFormModal({
  onSubmitForm,
}: BaseFormProps<TokenAmountFormValues>) {
  const balance = useEstimatedBTCBalance()
  // TODO: Use the right value from SDK when the logic for the withdraw will be ready
  const minTokenAmount = useMinDepositAmount()

  return (
    <TokenAmountForm
      tokenBalanceInputPlaceholder="BTC"
      currency="bitcoin"
      fiatCurrency="usd"
      tokenBalance={balance}
      minTokenAmount={minTokenAmount}
      onSubmitForm={onSubmitForm}
    >
      <UnstakeDetails balance={balance} currency="bitcoin" />
      <FormSubmitButton mt={10}>Withdraw</FormSubmitButton>
    </TokenAmountForm>
  )
}

export default UnstakeFormModal
