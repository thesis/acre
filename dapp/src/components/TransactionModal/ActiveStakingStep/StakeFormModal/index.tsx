import React, { useEffect } from "react"
import { Button } from "@chakra-ui/react"
import { BITCOIN_MIN_AMOUNT, REFERRAL } from "#/constants"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useStakeFlowContext, useWalletContext } from "#/hooks"
import { asyncWrapper } from "#/utils"
import Details from "./StakeDetails"

function StakeFormModal({
  onSubmitForm,
}: {
  onSubmitForm: (values: TokenAmountFormValues) => void
}) {
  const { btcAccount, ethAccount } = useWalletContext()
  const { initStake } = useStakeFlowContext()

  useEffect(() => {
    const btcAddress = btcAccount?.address
    const ethAddress = ethAccount?.address

    if (btcAddress && ethAddress) {
      const init = async () => {
        await initStake(btcAddress, ethAddress, REFERRAL)
      }
      asyncWrapper(init())
    }
  }, [btcAccount?.address, ethAccount?.address, initStake])

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
