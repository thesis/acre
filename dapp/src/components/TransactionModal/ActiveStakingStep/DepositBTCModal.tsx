import React, { useCallback } from "react"
import {
  useDepositBTCTransaction,
  useExecuteFunction,
  useModalFlowContext,
  useSendGeneratedDepositToSentry,
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
  useSendGeneratedDepositToSentry()

  const onStakeBTCSuccess = useCallback(() => {
    setStatus(PROCESS_STATUSES.SUCCEEDED)
  }, [setStatus])

  // TODO: After a failed attempt, we should display the message
  const onStakeBTCError = useCallback(() => {
    setStatus(PROCESS_STATUSES.FAILED)
  }, [setStatus])

  const handleStake = useExecuteFunction(
    stake,
    onStakeBTCSuccess,
    onStakeBTCError,
  )

  const onDepositBTCSuccess = useCallback(() => {
    setStatus(PROCESS_STATUSES.LOADING)

    asyncWrapper(handleStake())
  }, [setStatus, handleStake])

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
