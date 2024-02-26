import React, { useCallback } from "react"
import {
  useDepositBTCTransaction,
  useDepositTelemetry,
  useExecuteFunction,
  useModalFlowContext,
  useStakeFlowContext,
  useTransactionContext,
  useWalletContext,
} from "#/hooks"
import Alert from "#/components/shared/Alert"
import { TextMd } from "#/components/shared/Typography"
import { asyncWrapper } from "#/utils"
import { PROCESS_STATUSES } from "#/types"
import StakingStepsModalContent from "./StakingStepsModalContent"

export default function DepositBTCModal() {
  const { ethAccount } = useWalletContext()
  const { tokenAmount } = useTransactionContext()
  const { setStatus } = useModalFlowContext()
  const { btcAddress, depositReceipt, stake } = useStakeFlowContext()
  const depositTelemetry = useDepositTelemetry()

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
    // Let's call the stake function with a delay,
    // to make sure for the moment that it doesn't return an error about funds not found
    // TODO: Remove the delay when SDK is updated
    setTimeout(() => {
      asyncWrapper(handleStake())
    }, 10000)
  }, [setStatus, handleStake])

  const { sendBitcoinTransaction } =
    useDepositBTCTransaction(onDepositBTCSuccess)

  const handledDepositBTC = useCallback(async () => {
    if (!tokenAmount?.amount || !btcAddress || !depositReceipt || !ethAccount)
      return

    const response = await depositTelemetry(
      depositReceipt,
      btcAddress,
      ethAccount.address,
    )

    // TODO: Display the correct message for the user
    if (response.verificationStatus !== "valid") return

    asyncWrapper(sendBitcoinTransaction(tokenAmount?.amount, btcAddress))
  }, [
    btcAddress,
    depositReceipt,
    depositTelemetry,
    ethAccount,
    sendBitcoinTransaction,
    tokenAmount?.amount,
  ])

  const handledDepositBTCWrapper = useCallback(() => {
    asyncWrapper(handledDepositBTC())
  }, [handledDepositBTC])

  return (
    <StakingStepsModalContent
      buttonText="Deposit BTC"
      activeStep={1}
      onClick={handledDepositBTCWrapper}
    >
      <Alert>
        <TextMd>
          Make a Bitcoin transaction to deposit and stake your BTC.
        </TextMd>
      </Alert>
    </StakingStepsModalContent>
  )
}
