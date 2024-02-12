import React from "react"
import { Button } from "@chakra-ui/react"
import { BITCOIN_MIN_AMOUNT } from "#/constants"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useWalletContext } from "#/hooks"
import Spinner from "#/components/shared/Spinner"
import Details from "./StakeDetails"

const LOADING_STYLE = {
  _disabled: { background: "gold.300", opacity: 1 },
  _hover: { opacity: 1 },
}

function StakeFormModal({
  onSubmitForm,
  isLoading,
}: {
  onSubmitForm: (values: TokenAmountFormValues) => void
  isLoading?: boolean
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
      <Button
        type="submit"
        size="lg"
        width="100%"
        mt={4}
        isLoading={isLoading}
        spinner={<Spinner />}
        {...(isLoading && LOADING_STYLE)}
      >
        Stake
      </Button>
    </TokenAmountForm>
  )
}

export default StakeFormModal
