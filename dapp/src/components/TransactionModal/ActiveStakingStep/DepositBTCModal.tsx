import React, { useCallback, useEffect } from "react"
import {
  useActionFlowPause,
  useActionFlowTokenAmount,
  useAppDispatch,
  useDepositBTCTransaction,
  useExecuteFunction,
  useInvalidateQueries,
  useStakeFlowContext,
  useVerifyDepositAddress,
} from "#/hooks"
import { eip1193, logPromiseFailure } from "#/utils"
import { PROCESS_STATUSES } from "#/types"
import { Highlight } from "@chakra-ui/react"
import { TextMd } from "#/components/shared/Typography"
import { CardAlert } from "#/components/shared/alerts"
import { setStatus, setTxHash } from "#/store/action-flow"
import { queryKeys } from "#/constants"
import TriggerTransactionModal from "../TriggerTransactionModal"

export default function DepositBTCModal() {
  const tokenAmount = useActionFlowTokenAmount()
  const { btcAddress, depositReceipt, stake } = useStakeFlowContext()
  const verifyDepositAddress = useVerifyDepositAddress()
  const dispatch = useAppDispatch()
  const { handlePause } = useActionFlowPause()
  const invalidateQueries = useInvalidateQueries()

  const onStakeBTCSuccess = useCallback(() => {
    invalidateQueries({ queryKey: [queryKeys.BITCOIN_BALANCE] })
    dispatch(setStatus(PROCESS_STATUSES.SUCCEEDED))
  }, [dispatch, invalidateQueries])

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
  const showError = useCallback((error?: unknown) => {
    console.error(error)
  }, [])

  const onDepositBTCError = useCallback(
    (error: unknown) => {
      if (eip1193.didUserRejectRequest(error)) {
        handlePause()
      }

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
