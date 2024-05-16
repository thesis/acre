import React, { useCallback, useEffect } from "react"
import {
  useActionFlowTokenAmount,
  useAppDispatch,
  useDepositBTCTransaction,
  useDepositTelemetry,
  useExecuteFunction,
  useStakeFlowContext,
  useToast,
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
import { setStatus, setTxHash } from "#/store/action-flow"

const DELAY = ONE_SEC_IN_MILLISECONDS
const TOAST_ID = TOAST_IDS.DEPOSIT_TRANSACTION_ERROR
const TOAST = TOASTS[TOAST_ID]

export default function DepositBTCModal() {
  const { ethAccount } = useWalletContext()
  const tokenAmount = useActionFlowTokenAmount()
  const { btcAddress, depositReceipt, stake } = useStakeFlowContext()
  const depositTelemetry = useDepositTelemetry()
  const { closeToast, openToast } = useToast()
  const dispatch = useAppDispatch()

  const onStakeBTCSuccess = useCallback(
    () => dispatch(setStatus(PROCESS_STATUSES.SUCCEEDED)),
    [dispatch],
  )

  const onStakeBTCError = useCallback(() => {
    dispatch(setStatus(PROCESS_STATUSES.FAILED))
  }, [dispatch])

  const handleStake = useExecuteFunction(
    stake,
    onStakeBTCSuccess,
    onStakeBTCError,
  )

  const onDepositBTCSuccess = useCallback(() => {
    closeToast(TOAST_ID)
    dispatch(setStatus(PROCESS_STATUSES.LOADING))

    logPromiseFailure(handleStake())
  }, [closeToast, dispatch, handleStake])

  const showError = useCallback(() => {
    openToast({
      id: TOAST_ID,
      render: TOAST,
    })
  }, [openToast])

  const onDepositBTCError = useCallback(() => showError(), [showError])

  const { sendBitcoinTransaction, transactionHash } = useDepositBTCTransaction(
    onDepositBTCSuccess,
    onDepositBTCError,
  )

  useEffect(() => {
    if (transactionHash) {
      dispatch(setTxHash(transactionHash))
    }
  }, [dispatch, transactionHash])

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
