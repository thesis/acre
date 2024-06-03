import React, { useCallback, useEffect } from "react"
import {
  useActionFlowTokenAmount,
  useAppDispatch,
  useDepositBTCTransaction,
  useDepositTelemetry,
  useExecuteFunction,
  useStakeFlowContext,
  useToast,
} from "#/hooks"
import { logPromiseFailure } from "#/utils"
import { PROCESS_STATUSES } from "#/types"
import { TOASTS, TOAST_IDS } from "#/types/toast"
import { Highlight } from "@chakra-ui/react"
import { TextMd } from "#/components/shared/Typography"
import { CardAlert } from "#/components/shared/alerts"
import { setStatus, setTxHash } from "#/store/action-flow"
import TriggerTransactionModal from "../TriggerTransactionModal"

const TOAST_ID = TOAST_IDS.DEPOSIT_TRANSACTION_ERROR
const TOAST = TOASTS[TOAST_ID]

export default function DepositBTCModal() {
  const tokenAmount = useActionFlowTokenAmount()
  const { btcAddress, depositReceipt, stake } = useStakeFlowContext()
  const depositTelemetry = useDepositTelemetry()
  const { closeToast, openToast } = useToast()
  const dispatch = useAppDispatch()

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
    if (!tokenAmount?.amount || !btcAddress || !depositReceipt) return

    const response = await depositTelemetry(depositReceipt, btcAddress)

    if (response.verificationStatus === "valid") {
      logPromiseFailure(sendBitcoinTransaction(tokenAmount?.amount, btcAddress))
    } else {
      showError()
    }
  }, [
    btcAddress,
    depositReceipt,
    depositTelemetry,
    sendBitcoinTransaction,
    showError,
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
