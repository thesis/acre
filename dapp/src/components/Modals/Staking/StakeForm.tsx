import React, { useCallback } from "react"
import { ModalStep } from "../../../contexts"
import TokenAmountForm, {
  TokenAmountFormValues,
} from "../../shared/TokenAmountForm"
import { useTransactionContext, useWalletContext } from "../../../hooks"
import { BITCOIN_MIN_AMOUNT } from "../../../constants"
import { CurrencyType } from "../../../types"

const CURRENCY_TYPE: CurrencyType = "bitcoin"
const FORM_CUSTOM_DATA = {
  buttonText: "Stake",
  btcAmountText: "Amount to be staked",
  estimatedAmountText: "Approximately staked tokens",
}

function StakeForm({ goNext }: ModalStep) {
  const { btcAccount } = useWalletContext()
  const { seTokenAmount } = useTransactionContext()

  const handleSubmitForm = useCallback(
    (values: TokenAmountFormValues) => {
      if (!values.amount) return

      seTokenAmount({ amount: values.amount, currencyType: CURRENCY_TYPE })
      goNext()
    },
    [goNext, seTokenAmount],
  )

  return (
    <TokenAmountForm
      currencyType={CURRENCY_TYPE}
      customData={FORM_CUSTOM_DATA}
      tokenBalance={btcAccount?.balance.toString() ?? "0"}
      minTokenAmount={BITCOIN_MIN_AMOUNT}
      onSubmitForm={handleSubmitForm}
    />
  )
}

export default StakeForm
