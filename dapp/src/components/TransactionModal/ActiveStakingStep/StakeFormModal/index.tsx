import React from "react"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useAppSelector, useWalletContext } from "#/hooks"
import { FormSubmitButton } from "#/components/shared/Form"
import { selectMinStakeAmount } from "#/store/btc"
import StakeDetails from "./StakeDetails"

function StakeFormModal({
  onSubmitForm,
}: {
  onSubmitForm: (values: TokenAmountFormValues) => void
}) {
  const minStakeAmount = useAppSelector(selectMinStakeAmount)
  const { btcAccount } = useWalletContext()
  const tokenBalance = btcAccount?.balance.toString() ?? "0"

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
        maxTokenAmount={BigInt(tokenBalance)}
      />
      <FormSubmitButton mt={4}>Stake</FormSubmitButton>
    </TokenAmountForm>
  )
}

export default StakeFormModal
