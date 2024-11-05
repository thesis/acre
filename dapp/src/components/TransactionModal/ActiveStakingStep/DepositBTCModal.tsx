import React, { useCallback } from "react"
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
import { setStatus, setTxHash } from "#/store/action-flow"
import { ONE_SEC_IN_MILLISECONDS, queryKeysFactory } from "#/constants"
import { useTimeout } from "@chakra-ui/react"
import WalletInteractionModal from "../WalletInteractionModal"

const { userKeys } = queryKeysFactory

export default function DepositBTCModal() {
  const tokenAmount = useActionFlowTokenAmount()
  const { btcAddress, depositReceipt, stake } = useStakeFlowContext()
  const verifyDepositAddress = useVerifyDepositAddress()
  const dispatch = useAppDispatch()
  const { handlePause } = useActionFlowPause()
  const handleBitcoinBalanceInvalidation = useInvalidateQueries({
    queryKey: userKeys.balance(),
  })

  const onStakeBTCSuccess = useCallback(() => {
    handleBitcoinBalanceInvalidation()
    dispatch(setStatus(PROCESS_STATUSES.SUCCEEDED))
  }, [dispatch, handleBitcoinBalanceInvalidation])

  const onError = useCallback(
    () => dispatch(setStatus(PROCESS_STATUSES.FAILED)),
    [dispatch],
  )

  const handleStake = useExecuteFunction(stake, onStakeBTCSuccess, onError)

  const onDepositBTCSuccess = useCallback(
    (transactionHash: string) => {
      dispatch(setTxHash(transactionHash))
      logPromiseFailure(handleStake())
    },
    [dispatch, handleStake],
  )

  const onDepositBTCError = useCallback(
    (error: unknown) => {
      if (eip1193.didUserRejectRequest(error)) {
        handlePause()
      } else {
        onError()
      }
    },
    [onError, handlePause],
  )

  const { sendBitcoinTransaction, status } = useDepositBTCTransaction(
    onDepositBTCSuccess,
    onDepositBTCError,
  )

  const handledDepositBTC = useCallback(async () => {
    if (!tokenAmount?.amount || !btcAddress || !depositReceipt) return
    const verificationStatus = await verifyDepositAddress(
      depositReceipt,
      btcAddress,
    )

    if (verificationStatus === "valid") {
      sendBitcoinTransaction({
        recipient: btcAddress,
        amount: tokenAmount?.amount,
      })
    } else {
      onError()
    }
  }, [
    tokenAmount?.amount,
    btcAddress,
    depositReceipt,
    verifyDepositAddress,
    sendBitcoinTransaction,
    onError,
  ])

  const handledDepositBTCWrapper = useCallback(() => {
    logPromiseFailure(handledDepositBTC())
  }, [handledDepositBTC])

  useTimeout(handledDepositBTCWrapper, ONE_SEC_IN_MILLISECONDS)

  if (status === "pending" || status === "success")
    return <WalletInteractionModal step="awaiting-transaction" />

  return <WalletInteractionModal step="opening-wallet" />
}
