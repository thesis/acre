import React from "react"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { FormSubmitButton } from "#/components/shared/Form"
import { ACTION_FLOW_TYPES, BaseFormProps, PROCESS_STATUSES } from "#/types"
import {
  useActionFlowStatus,
  useBitcoinPosition,
  useMinWithdrawAmount,
} from "#/hooks"
import { fixedPointNumberToString, getCurrencyByType } from "#/utils"
import UnstakeDetails from "./UnstakeDetails"
import ActionDurationEstimation from "../../ActionDurationEstimation"

function UnstakeFormModal({
  onSubmitForm,
}: BaseFormProps<TokenAmountFormValues>) {
  const { data } = useBitcoinPosition()
  const balance = data?.estimatedBitcoinBalance ?? 0n
  const minTokenAmount = useMinWithdrawAmount()
  const status = useActionFlowStatus()

  const { decimals } = getCurrencyByType("bitcoin")
  const inputPlaceholder = `Minimum ${fixedPointNumberToString(minTokenAmount, decimals)} BTC`
  const tokenAmountLabel = "Acre balance"
  const defaultAmount =
    status === PROCESS_STATUSES.REFINE_AMOUNT ? balance : undefined

  return (
    <TokenAmountForm
      actionType={ACTION_FLOW_TYPES.UNSTAKE}
      tokenBalanceInputPlaceholder={inputPlaceholder}
      tokenAmountLabel={tokenAmountLabel}
      currency="bitcoin"
      tokenBalance={balance}
      minTokenAmount={minTokenAmount}
      onSubmitForm={onSubmitForm}
      withMaxButton
      defaultAmount={defaultAmount}
    >
      <UnstakeDetails balance={balance} currency="bitcoin" />
      <FormSubmitButton mt={10}>Withdraw</FormSubmitButton>
      <ActionDurationEstimation type="withdraw" />
    </TokenAmountForm>
  )
}

export default UnstakeFormModal
