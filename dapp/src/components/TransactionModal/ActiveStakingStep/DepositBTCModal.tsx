import React, { useCallback, useEffect, useState } from "react"
import {
  useDepositBTCTransaction,
  useDepositTelemetry,
  useExecuteFunction,
  useModalFlowContext,
  useStakeFlowContext,
  useToast,
  useTransactionContext,
  useWalletContext,
} from "#/hooks"
import { TextMd, TextSm } from "#/components/shared/Typography"
import { ERRORS, logPromiseFailure } from "#/utils"
import { PROCESS_STATUSES } from "#/types"
import { CardAlert, Toast } from "#/components/shared/alerts"
import StakingStepsModalContent from "./StakingStepsModalContent"

export default function DepositBTCModal() {
  const { ethAccount } = useWalletContext()
  const { tokenAmount } = useTransactionContext()
  const { setStatus } = useModalFlowContext()
  const { btcAddress, depositReceipt, stake } = useStakeFlowContext()
  const depositTelemetry = useDepositTelemetry()

  const [isLoading, setIsLoading] = useState(false)

  const { closeToast, showToast } = useToast({
    id: "deposit-btc-error-toast",
    render: ({ onClose }) => (
      <Toast
        status="error"
        title={ERRORS.DEPOSIT_TRANSACTION}
        onClose={onClose}
      >
        <TextSm>Please try again.</TextSm>
      </Toast>
    ),
  })

  useEffect(() => () => closeToast(), [closeToast])

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

    logPromiseFailure(handleStake())
  }, [setStatus, handleStake])

  const onDepositBTCError = useCallback(showToast, [showToast])

  const { sendBitcoinTransaction } = useDepositBTCTransaction(
    onDepositBTCSuccess,
    onDepositBTCError,
  )

  const handledDepositBTC = useCallback(async () => {
    if (!tokenAmount?.amount || !btcAddress || !depositReceipt || !ethAccount)
      return

    setIsLoading(true)
    const response = await depositTelemetry(
      depositReceipt,
      btcAddress,
      ethAccount.address,
    )
    setIsLoading(false)
    // TODO: Display the correct message for the user
    if (response.verificationStatus !== "valid") return

    logPromiseFailure(sendBitcoinTransaction(tokenAmount?.amount, btcAddress))
  }, [
    btcAddress,
    depositReceipt,
    depositTelemetry,
    ethAccount,
    sendBitcoinTransaction,
    tokenAmount?.amount,
  ])

  const handledDepositBTCWrapper = useCallback(() => {
    logPromiseFailure(handledDepositBTC())
  }, [handledDepositBTC])

  return (
    <StakingStepsModalContent
      buttonText="Deposit BTC"
      activeStep={1}
      isLoading={isLoading}
      onClick={handledDepositBTCWrapper}
    >
      <CardAlert status="error">
        <TextMd>
          Make a Bitcoin transaction to deposit and stake your BTC.
        </TextMd>
      </CardAlert>
    </StakingStepsModalContent>
  )
}
