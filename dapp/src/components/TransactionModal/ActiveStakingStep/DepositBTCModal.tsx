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
import { isLedgerLiveError, logPromiseFailure } from "#/utils"
import { PROCESS_STATUSES, LedgerLiveError } from "#/types"
import { Highlight } from "@chakra-ui/react"
import { TextMd } from "#/components/shared/Typography"
import { CardAlert } from "#/components/shared/alerts"
import { setStatus, setTxHash } from "#/store/action-flow"
import TriggerTransactionModal from "../TriggerTransactionModal"

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
  const showError = useCallback((error?: LedgerLiveError) => {
    console.error(error)
  }, [])

  const onDepositBTCError = useCallback(
    (error: unknown) => {
      if (!isLedgerLiveError(error)) return

      const isInterrupted =
        error.message && error.message.includes("Signature interrupted by user")
      if (isInterrupted) handlePause()

      showError(error)
    },
    [showError, handlePause],
  )

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
    if (!tokenAmount?.amount || !btcAddress || !depositReceipt) return
    const status = await verifyDepositAddress(depositReceipt, btcAddress)

    if (status === "valid") {
      await sendBitcoinTransaction(btcAddress, tokenAmount?.amount)
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

  return (
    <TriggerTransactionModal callback={handledDepositBTCWrapper}>
      <CardAlert>
        <TextMd>
          <Highlight query="Rewards" styles={{ fontWeight: "bold" }}>
            You will receive your Rewards once the deposit transaction is
            completed.
          </Highlight>
        </TextMd>
      </CardAlert>
    </TriggerTransactionModal>
  )
}
