import React, { useCallback } from "react"
import { Button } from "@chakra-ui/react"
import { BITCOIN_MIN_AMOUNT } from "../../../../constants"
import { ModalStep } from "../../../../contexts"
import { useWalletContext, useTransactionContext } from "../../../../hooks"
import TokenAmountForm from "../../../shared/TokenAmountForm"
import { TokenAmountFormValues } from "../../../shared/TokenAmountForm/TokenAmountFormBase"
import Details from "./Details"

function StakeForm({ goNext }: ModalStep) {
  const { btcAccount } = useWalletContext()
  const { seTokenAmount } = useTransactionContext()

  const handleSubmitForm = useCallback(
    (values: TokenAmountFormValues) => {
      if (!values.amount) return

      seTokenAmount({ amount: values.amount, currency: "bitcoin" })
      goNext()
    },
    [goNext, seTokenAmount],
  )

  return (
    <TokenAmountForm
      tokenBalanceInputPlaceholder="BTC"
      currency="bitcoin"
      tokenBalance={btcAccount?.balance.toString() ?? "0"}
      minTokenAmount={BITCOIN_MIN_AMOUNT}
      onSubmitForm={handleSubmitForm}
    >
      <Details currency="bitcoin" />
      <Button type="submit" size="lg" width="100%" mt={4}>
        Stake
      </Button>
    </TokenAmountForm>
  )
}

export default StakeForm
