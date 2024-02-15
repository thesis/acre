import React from "react"
import { BITCOIN_MIN_AMOUNT } from "#/constants"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useWalletContext } from "#/hooks"
import { FormSubmitButton } from "#/components/shared/Form/FormSubmitButton"
import StakeDetails from "./StakeDetails"

function StakeFormModal({
  onSubmitForm,
}: {
  onSubmitForm: (values: TokenAmountFormValues) => void
}) {
  const { btcAccount } = useWalletContext()
  const tokenBalance = btcAccount?.balance.toString() ?? "0"

  return (
    <TokenAmountForm
      tokenBalanceInputPlaceholder="BTC"
      currency="bitcoin"
      tokenBalance={tokenBalance}
      minTokenAmount={BITCOIN_MIN_AMOUNT}
      onSubmitForm={onSubmitForm}
    >
      <StakeDetails
        currency="bitcoin"
        minTokenAmount={BITCOIN_MIN_AMOUNT}
        maxTokenAmount={tokenBalance}
      />
      <FormSubmitButton>Stake</FormSubmitButton>
    </TokenAmountForm>
  )
}

export default StakeFormModal
