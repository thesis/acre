import React from "react"
import { Button } from "@chakra-ui/react"
import { BITCOIN_MIN_AMOUNT } from "#/constants"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useWalletContext } from "#/hooks"
import Details from "./StakeDetails"

function StakeFormModal({
  onSubmitForm,
}: {
  onSubmitForm: (values: TokenAmountFormValues) => void
}) {
  const { btcAccount } = useWalletContext()

  return (
    <TokenAmountForm
      tokenBalanceInputPlaceholder="BTC"
      currency="bitcoin"
      tokenBalance={btcAccount?.balance.toString() ?? "0"}
      minTokenAmount={BITCOIN_MIN_AMOUNT}
      onSubmitForm={onSubmitForm}
    >
      <Details currency="bitcoin" />
      <Button type="submit" size="lg" width="100%" mt={4}>
        Stake
      </Button>
    </TokenAmountForm>
  )
}

export default StakeFormModal
