import React, { useCallback, useEffect } from "react"
import {
  useActionFlowPause,
  useActionFlowTokenAmount,
  useAppDispatch,
  useDepositBTCTransaction,
  useExecuteFunction,
  useStakeFlowContext,
  useVerifyDepositAddress,
} from "#/hooks"
import { logPromiseFailure } from "#/utils"
import { OnErrorCallback, PROCESS_STATUSES, TransactionError } from "#/types"
import { ModalBody, ModalHeader, Highlight, useTimeout } from "@chakra-ui/react"
import Spinner from "#/components/shared/Spinner"
import { TextMd } from "#/components/shared/Typography"
import { CardAlert } from "#/components/shared/alerts"
import { ONE_SEC_IN_MILLISECONDS } from "#/constants"
import { setStatus, setTxHash } from "#/store/action-flow"

const DELAY = ONE_SEC_IN_MILLISECONDS

export default function DepositBTCModal() {
  const tokenAmount = useActionFlowTokenAmount()
  const { btcAddress, depositReceipt, stake } = useStakeFlowContext()
  const verifyDepositAddress = useVerifyDepositAddress()
  const dispatch = useAppDispatch()
  const { handlePause } = useActionFlowPause()

  const onStakeBTCSuccess = useCallback(() => {
    dispatch(setStatus(PROCESS_STATUSES.SUCCEEDED))
  }, [dispatch])

  const onStakeBTCError = useCallback(() => {
    dispatch(setStatus(PROCESS_STATUSES.FAILED))
  }, [dispatch])

  const handleStake = useExecuteFunction(
    stake,
    onStakeBTCSuccess,
    onStakeBTCError,
  )

  const onDepositBTCSuccess = useCallback(() => {
    dispatch(setStatus(PROCESS_STATUSES.LOADING))

    logPromiseFailure(handleStake())
  }, [dispatch, handleStake])

  // TODO: Handle when the function fails
  const showError = useCallback((error?: TransactionError) => {
    console.error(error)
  }, [])

  const onDepositBTCError = useCallback(
    (error: TransactionError) => {
      // TODO: Find a better way to distinguish between error types
      const isInterrupted = error.message?.includes("interrupted")
      if (isInterrupted) handlePause()

      showError(error)
    },
    [showError, handlePause],
  )

  const { sendBitcoinTransaction, transactionHash } = useDepositBTCTransaction(
    onDepositBTCSuccess,
    onDepositBTCError as OnErrorCallback,
  )

  useEffect(() => {
    if (transactionHash) {
      dispatch(setTxHash(transactionHash))
    }
  }, [dispatch, transactionHash])

  const handledDepositBTC = useCallback(async () => {
    if (!tokenAmount?.amount || !btcAddress || !depositReceipt) return
    const status = await verifyDepositAddress(depositReceipt, btcAddress)

    if (status === "valid") {
      await sendBitcoinTransaction(tokenAmount?.amount, btcAddress)
    } else {
      showError()
    }
  }, [
    btcAddress,
    depositReceipt,
    showError,
    verifyDepositAddress,
    sendBitcoinTransaction,
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
