import React from "react"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useMinDepositAmount, useWallet } from "#/hooks"
import { FormSubmitButton } from "#/components/shared/Form"
import { BaseFormProps } from "#/types"
import StakeDetails from "./StakeDetails"

function StakeFormModal({
  onSubmitForm,
}: BaseFormProps<TokenAmountFormValues>) {
  const minDepositAmount = useMinDepositAmount()
  const { balance: tokenBalance } = useWallet()

  return (
    <TokenAmountForm
      tokenBalanceInputPlaceholder="BTC"
      currency="bitcoin"
      fiatCurrency="usd"
      tokenBalance={tokenBalance}
      minTokenAmount={minDepositAmount}
      onSubmitForm={onSubmitForm}
    >
      <StakeDetails currency="bitcoin" />
      <FormSubmitButton mt={10}>Stake</FormSubmitButton>
    </TokenAmountForm>
  )
}

export default StakeFormModal
