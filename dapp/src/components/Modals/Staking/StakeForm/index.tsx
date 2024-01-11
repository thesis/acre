import React, { useCallback } from "react"
import { Button } from "@chakra-ui/react"
import { BITCOIN_MIN_AMOUNT } from "~/constants"
import { ModalStep } from "~/contexts"
import TokenAmountForm from "~/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "~/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useWalletContext, useTransactionContext } from "~/hooks"
import Details from "./Details"

function StakeForm({ goNext }: ModalStep) {
  const { btcAccount } = useWalletContext()
  const { setTokenAmount } = useTransactionContext()

  const handleSubmitForm = useCallback(
    (values: TokenAmountFormValues) => {
      if (!values.amount) return

      setTokenAmount({ amount: values.amount, currency: "bitcoin" })
      goNext()
    },
    [goNext, setTokenAmount],
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
