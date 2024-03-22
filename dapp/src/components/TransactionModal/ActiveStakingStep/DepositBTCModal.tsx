import React, { useCallback, useState } from "react"
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
import { TextMd } from "#/components/shared/Typography"
import { logPromiseFailure } from "#/utils"
import { PROCESS_STATUSES, TOAST_TYPES } from "#/types"
import { CardAlert } from "#/components/shared/alerts"
import { TOASTS } from "#/components/shared/toasts"
import StakingStepsModalContent from "./StakingStepsModalContent"

const TOAST_ID = TOAST_TYPES.DEPOSIT_TRANSACTION_ERROR

export default function DepositBTCModal() {
  const { ethAccount } = useWalletContext()
  const { tokenAmount } = useTransactionContext()
  const { setStatus } = useModalFlowContext()
  const { btcAddress, depositReceipt, stake } = useStakeFlowContext()
  const depositTelemetry = useDepositTelemetry()
  const { close: closeToast, open: openToast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [buttonText, setButtonText] = useState("Deposit BTC")

  const onStakeBTCSuccess = useCallback(
    () => setStatus(PROCESS_STATUSES.SUCCEEDED),
    [setStatus],
  )

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
    closeToast(TOAST_ID)
    setStatus(PROCESS_STATUSES.LOADING)

    logPromiseFailure(handleStake())
  }, [closeToast, setStatus, handleStake])

  const showError = useCallback(() => {
    openToast(TOASTS[TOAST_ID]())
    setButtonText("Try again")
  }, [openToast])

  const onDepositBTCError = useCallback(() => showError(), [showError])

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

    if (response.verificationStatus === "valid") {
      logPromiseFailure(sendBitcoinTransaction(tokenAmount?.amount, btcAddress))
    } else {
      showError()
    }
  }, [
    btcAddress,
    depositReceipt,
    depositTelemetry,
    ethAccount,
    sendBitcoinTransaction,
    showError,
    tokenAmount?.amount,
  ])

  const handledDepositBTCWrapper = useCallback(() => {
    logPromiseFailure(handledDepositBTC())
  }, [handledDepositBTC])

  return (
    <StakingStepsModalContent
      buttonText={buttonText}
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
