import React from "react"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { FormSubmitButton } from "#/components/shared/Form"
import { BaseFormProps } from "#/types"
import { useBitcoinPosition, useMinWithdrawAmount } from "#/hooks"
import UnstakeDetails from "./UnstakeDetails"

function UnstakeFormModal({
  onSubmitForm,
}: BaseFormProps<TokenAmountFormValues>) {
  const { data } = useBitcoinPosition()
  const balance = data?.estimatedBitcoinBalance ?? 0n
  const minTokenAmount = useMinWithdrawAmount()

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
