import React from "react"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { FormSubmitButton } from "#/components/shared/Form"
import { BaseFormProps } from "#/types"
import { useEstimatedBTCBalance } from "#/hooks"
import UnstakeDetails from "./UnstakeDetails"

function UnstakeFormModal({
  onSubmitForm,
}: BaseFormProps<TokenAmountFormValues>) {
  const balance = useEstimatedBTCBalance()

  return (
    <TokenAmountForm
      tokenBalanceInputPlaceholder="BTC"
      currency="bitcoin"
      fiatCurrency="usd"
      tokenBalance={balance}
      minTokenAmount={0n}
      onSubmitForm={onSubmitForm}
    >
      <UnstakeDetails balance={balance ?? 0n} currency="bitcoin" />
      <FormSubmitButton mt={10}>Withdraw</FormSubmitButton>
    </TokenAmountForm>
  )
}

export default UnstakeFormModal
