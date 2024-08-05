import React from "react"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useMinDepositAmount, useWallet } from "#/hooks"
import { FormSubmitButton } from "#/components/shared/Form"
import { BaseFormProps } from "#/types"
import { formatTokenAmount, getCurrencyByType } from "#/utils"
import StakeDetails from "./StakeDetails"

function StakeFormModal({
  onSubmitForm,
}: BaseFormProps<TokenAmountFormValues>) {
  const minDepositAmount = useMinDepositAmount()
  const { balance: tokenBalance } = useWallet()

  const { decimals, desiredDecimals } = getCurrencyByType("bitcoin")
  const inputPlaceholder = `Minimum ${formatTokenAmount(minDepositAmount, decimals, desiredDecimals)} BTC`

  return (
    <TokenAmountForm
      tokenBalanceInputPlaceholder={inputPlaceholder}
      currency="bitcoin"
      tokenBalance={tokenBalance ?? 0n}
      minTokenAmount={minDepositAmount}
      onSubmitForm={onSubmitForm}
      withMaxButton={false}
    >
      <StakeDetails currency="bitcoin" />
      <FormSubmitButton mt={10}>Deposit</FormSubmitButton>
    </TokenAmountForm>
  )
}

export default StakeFormModal
