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

  const { sendBitcoinTransaction, transactionHash, inProgress } =
    useDepositBTCTransaction(onDepositBTCSuccess, onDepositBTCError)

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

  useTimeout(handledDepositBTCWrapper, ONE_SEC_IN_MILLISECONDS)

  if (inProgress) return <WalletInteractionModal step="awaiting-transaction" />

  return <WalletInteractionModal step="opening-wallet" />
}
