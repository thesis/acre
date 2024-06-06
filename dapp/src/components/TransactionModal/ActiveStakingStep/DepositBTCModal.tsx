import React, { useCallback, useEffect } from "react"
import {
  useActionFlowTokenAmount,
  useAppDispatch,
  useDepositBTCTransaction,
  useExecuteFunction,
  useStakeFlowContext,
  useVerifyDepositAddress,
} from "#/hooks"
import { logPromiseFailure } from "#/utils"
import { PROCESS_STATUSES } from "#/types"
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
  const showError = useCallback(() => {}, [])

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
