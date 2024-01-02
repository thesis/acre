import React, { useCallback } from "react"
import { ModalStep } from "../../../contexts"
import TokenAmountForm, {
  TokenAmountFormValues,
} from "../../shared/TokenAmountForm"
import { useTransactionContext, useWalletContext } from "../../../hooks"
import { BITCOIN_MIN_AMOUNT } from "../../../constants"

const CUSTOM_DATA = {
  buttonText: "Stake",
  btcAmountText: "Amount to be staked",
  estimatedAmountText: "Approximately staked tokens",
}

function StakeForm({ goNext }: ModalStep) {
  const { btcAccount } = useWalletContext()
  const { setAmount } = useTransactionContext()

  const handleSubmitForm = useCallback(
    (values: TokenAmountFormValues) => {
      setAmount(values.amount)
      goNext()
    },
    [goNext, setAmount],
  )

  return (
    <TokenAmountForm
      customData={CUSTOM_DATA}
      tokenBalance={btcAccount?.balance.toString() ?? "0"}
      minTokenAmount={BITCOIN_MIN_AMOUNT}
      onSubmitForm={handleSubmitForm}
    />
  )
}

export default StakeForm
