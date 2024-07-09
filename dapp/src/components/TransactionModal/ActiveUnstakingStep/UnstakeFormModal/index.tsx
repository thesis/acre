import React from "react"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { FormSubmitButton } from "#/components/shared/Form"
import { BaseFormProps, PROCESS_STATUSES } from "#/types"
import {
  useActionFlowStatus,
  useActionFlowTokenAmount,
  useBitcoinPosition,
  useMinWithdrawAmount,
} from "#/hooks"
import UnstakeDetails from "./UnstakeDetails"

function UnstakeFormModal({
  onSubmitForm,
}: BaseFormProps<TokenAmountFormValues>) {
  const { data } = useBitcoinPosition()
  const balance = data?.estimatedBitcoinBalance ?? 0n
  const minTokenAmount = useMinWithdrawAmount()
  const unstakeAmount = useActionFlowTokenAmount()
  const status = useActionFlowStatus()

  return (
    <TokenAmountForm
      tokenBalanceInputPlaceholder="BTC"
      currency="bitcoin"
      fiatCurrency="usd"
      tokenBalance={balance}
      minTokenAmount={minTokenAmount}
      onSubmitForm={onSubmitForm}
      withMaxButton
      defaultAmount={
        status === PROCESS_STATUSES.REFINE_AMOUNT
          ? unstakeAmount?.amount
          : undefined
      }
    >
      <UnstakeDetails balance={balance} currency="bitcoin" />
      <FormSubmitButton mt={10}>Withdraw</FormSubmitButton>
    </TokenAmountForm>
  )
}

export default UnstakeFormModal
