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
import { eip1193, logPromiseFailure } from "#/utils"
import { PROCESS_STATUSES } from "#/types"
import { Highlight } from "@chakra-ui/react"
import { TextMd } from "#/components/shared/Typography"
import { setStatus, setTxHash } from "#/store/action-flow"
import { Alert, AlertIcon, AlertDescription } from "#/components/shared/Alert"
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

  const onError = useCallback(
    (error?: unknown) => {
      console.error(error)
      dispatch(setStatus(PROCESS_STATUSES.FAILED))
    },
    [dispatch],
  )

  const handleStake = useExecuteFunction(stake, onStakeBTCSuccess, onError)

  const onDepositBTCSuccess = useCallback(() => {
    dispatch(setStatus(PROCESS_STATUSES.LOADING))

    logPromiseFailure(handleStake())
  }, [dispatch, handleStake])

  const onDepositBTCError = useCallback(
    (error: unknown) => {
      if (eip1193.didUserRejectRequest(error)) {
        handlePause()
      } else {
        onError(error)
      }
    },
    [onError, handlePause],
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
      onError()
    }
  }, [
    btcAddress,
    depositReceipt,
    onError,
    verifyDepositAddress,
    sendBitcoinTransaction,
    tokenAmount?.amount,
  ])

  const handledDepositBTCWrapper = useCallback(() => {
    logPromiseFailure(handledDepositBTC())
  }, [handledDepositBTC])

  return (
    <TriggerTransactionModal callback={handledDepositBTCWrapper}>
      <Alert variant="elevated">
        <AlertIcon />
        <AlertDescription>
          <TextMd>
            <Highlight query="Rewards" styles={{ fontWeight: "bold" }}>
              You will receive your Rewards once the deposit transaction is
              completed.
            </Highlight>
          </TextMd>
        </AlertDescription>
      </Alert>
    </TriggerTransactionModal>
  )
}
