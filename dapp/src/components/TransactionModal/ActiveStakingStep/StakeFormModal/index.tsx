import React from "react"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useMinStakeAmount, useWalletContext } from "#/hooks"
import { FormSubmitButton } from "#/components/shared/Form"
import StakeDetails from "./StakeDetails"

function StakeFormModal({
  onSubmitForm,
}: {
  onSubmitForm: (values: TokenAmountFormValues) => void
}) {
  const minStakeAmount = useMinStakeAmount()
  const { btcAccount } = useWalletContext()
  const tokenBalance = BigInt(btcAccount?.balance.toString() ?? "0")

  return (
    <TokenAmountForm
      tokenBalanceInputPlaceholder="BTC"
      currency="bitcoin"
      tokenBalance={tokenBalance}
      minTokenAmount={minStakeAmount}
      onSubmitForm={onSubmitForm}
    >
      <StakeDetails
        currency="bitcoin"
        minTokenAmount={minStakeAmount}
        maxTokenAmount={tokenBalance}
      />
      <FormSubmitButton mt={4}>Stake</FormSubmitButton>
    </TokenAmountForm>
  )
}

export default StakeFormModal
