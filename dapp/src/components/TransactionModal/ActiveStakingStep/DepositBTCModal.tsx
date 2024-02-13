import React, { useCallback } from "react"
import {
  useDepositBTCTransaction,
  useModalFlowContext,
  useSendTransaction,
  useStakeFlowContext,
  useTransactionContext,
} from "#/hooks"
import Alert from "#/components/shared/Alert"
import { TextMd } from "#/components/shared/Typography"
import { asyncWrapper } from "#/utils"
import { PROCESS_STATUSES } from "#/types"
import StakingStepsModalContent from "./StakingStepsModalContent"

export default function DepositBTCModal() {
  const { tokenAmount } = useTransactionContext()
  const { setStatus } = useModalFlowContext()
  const { btcAddress, stake } = useStakeFlowContext()

  const onStakeBTCSuccess = useCallback(() => {
    setStatus(PROCESS_STATUSES.SUCCEEDED)
  }, [setStatus])

  // TODO: After a failed attempt, we should display the message
  const onStakeBTCError = useCallback(() => {
    setStatus(PROCESS_STATUSES.FAILED)
  }, [setStatus])

  const { sendTransaction: sendStakeTransaction } = useSendTransaction(
    stake,
    onStakeBTCSuccess,
    onStakeBTCError,
  )

  const onDepositBTCSuccess = useCallback(() => {
    setStatus(PROCESS_STATUSES.LOADING)
    // Let's call the stake function with a delay,
    // to make sure for the moment that it doesn't return an error about funds not found
    // TODO: Remove the delay when SDK is updated
    setTimeout(() => {
      asyncWrapper(sendStakeTransaction())
    }, 10000)
  }, [sendStakeTransaction, setStatus])

  const { sendBitcoinTransaction } =
    useDepositBTCTransaction(onDepositBTCSuccess)

  const handledDepositBTC = useCallback(() => {
    if (!tokenAmount?.amount || !btcAddress) return

    asyncWrapper(sendBitcoinTransaction(tokenAmount?.amount, btcAddress))
  }, [btcAddress, sendBitcoinTransaction, tokenAmount])

  return (
    <StakingStepsModalContent
      buttonText="Deposit BTC"
      activeStep={1}
      onClick={handledDepositBTC}
    >
      <Alert>
        <TextMd>
          Make a Bitcoin transaction to deposit and stake your BTC.
        </TextMd>
      </Alert>
    </StakingStepsModalContent>
  )
}
