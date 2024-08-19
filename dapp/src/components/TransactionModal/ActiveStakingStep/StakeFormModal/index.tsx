import React from "react"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useMinDepositAmount, useWallet } from "#/hooks"
import { FormSubmitButton } from "#/components/shared/Form"
import { ACTION_FLOW_TYPES, BaseFormProps } from "#/types"
import { fixedPointNumberToString, getCurrencyByType } from "#/utils"
import StakeDetails from "./StakeDetails"

function StakeFormModal({
  onSubmitForm,
}: BaseFormProps<TokenAmountFormValues>) {
  const minDepositAmount = useMinDepositAmount()
  const { balance: tokenBalance } = useWallet()

  const { decimals } = getCurrencyByType("bitcoin")
  const inputPlaceholder = `Minimum ${fixedPointNumberToString(minDepositAmount, decimals)} BTC`
  const tokenAmountLabel = "Wallet balance"

  return (
    <TokenAmountForm
      actionType={ACTION_FLOW_TYPES.STAKE}
      tokenBalanceInputPlaceholder={inputPlaceholder}
      tokenAmountLabel={tokenAmountLabel}
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
