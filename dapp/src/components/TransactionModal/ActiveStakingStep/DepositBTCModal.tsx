import React, { useCallback } from "react"
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
import CardAlert from "#/components/shared/CardAlert"
import Toast from "#/components/shared/Toast"
import StakingStepsModalContent from "./StakingStepsModalContent"

const ID_TOAST = "deposit-btc-error-toast"

export default function DepositBTCModal() {
  const { ethAccount } = useWalletContext()
  const { tokenAmount } = useTransactionContext()
  const { setStatus } = useModalFlowContext()
  const { btcAddress, depositReceipt, stake } = useStakeFlowContext()
  const depositTelemetry = useDepositTelemetry()

  const toast = useToast({
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
      logPromiseFailure(handleStake())
    }, 10000)
  }, [setStatus, handleStake])

  const onDepositBTCError = useCallback(() => {
    if (!toast.isActive(ID_TOAST)) {
      toast({
        id: ID_TOAST,
      })
    }
  }, [toast])

  const { sendBitcoinTransaction } = useDepositBTCTransaction(
    onDepositBTCSuccess,
    onDepositBTCError,
  )

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
