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
import { logPromiseFailure } from "#/utils"
import { PROCESS_STATUSES } from "#/types"
import { TOASTS, TOAST_IDS } from "#/types/toast"
import { ModalBody, ModalHeader, Highlight, useTimeout } from "@chakra-ui/react"
import Spinner from "#/components/shared/Spinner"
import { TextMd } from "#/components/shared/Typography"
import { CardAlert } from "#/components/shared/alerts"
import { ONE_SEC_IN_MILLISECONDS } from "#/constants"

const DELAY = ONE_SEC_IN_MILLISECONDS * 3
const TOAST_ID = TOAST_IDS.DEPOSIT_TRANSACTION_ERROR
const TOAST = TOASTS[TOAST_ID]

export default function DepositBTCModal() {
  const { ethAccount } = useWalletContext()
  const { tokenAmount } = useTransactionContext()
  const { setStatus } = useModalFlowContext()
  const { btcAddress, depositReceipt, stake } = useStakeFlowContext()
  const depositTelemetry = useDepositTelemetry()
  const { closeToast, openToast } = useToast()

  const onStakeBTCSuccess = useCallback(
    () => setStatus(PROCESS_STATUSES.SUCCEEDED),
    [setStatus],
  )

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
    openToast({
      id: TOAST_ID,
      render: TOAST,
    })
  }, [openToast])

  const onDepositBTCError = useCallback(() => showError(), [showError])

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

  useTimeout(handledDepositBTCWrapper, DELAY)

  return (
    <>
      <ModalHeader>Waiting transaction...</ModalHeader>
      <ModalBody>
        <Spinner size="xl" />
        <TextMd>Please complete the transaction in your wallet.</TextMd>
        <CardAlert>
          <TextMd>
            <Highlight query="Rewards" styles={{ fontWeight: "bold" }}>
              You will receive your Rewards once the deposit transaction is
              completed.
            </Highlight>
          </TextMd>
        </CardAlert>
      </ModalBody>
    </>
  )
}
