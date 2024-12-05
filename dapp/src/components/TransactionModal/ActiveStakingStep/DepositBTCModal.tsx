import { ONE_SEC_IN_MILLISECONDS, queryKeysFactory } from "#/constants"
import {
  useActionFlowPause,
  useActionFlowTokenAmount,
  useAppDispatch,
  useCancelPromise,
  useDepositBTCTransaction,
  useInvalidateQueries,
  useStakeFlowContext,
  useVerifyDepositAddress,
} from "#/hooks"
import { usePostHogCapture } from "#/hooks/posthog/usePostHogCapture"
import { PostHogEvent } from "#/posthog/events"
import { setStatus, setTxHash } from "#/store/action-flow"
import { PROCESS_STATUSES } from "#/types"
import { eip1193, logPromiseFailure } from "#/utils"
import { useTimeout } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { useCallback, useRef } from "react"
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
  const { handleCapture, handleCaptureWithCause } = usePostHogCapture()

  const sessionId = useRef(Math.random())
  const { cancel, resolve, sessionIdToPromise } = useCancelPromise(
    sessionId.current,
    "Deposit cancelled",
  )

  const onStakeBTCSuccess = useCallback(() => {
    handleBitcoinBalanceInvalidation()
    dispatch(setStatus(PROCESS_STATUSES.SUCCEEDED))
  }, [dispatch, handleBitcoinBalanceInvalidation])

  const onError = useCallback(
    (error: unknown) => {
      console.error(error)
      dispatch(setStatus(PROCESS_STATUSES.FAILED))
    },
    [dispatch],
  )

  const { mutate: handleStake } = useMutation({
    mutationKey: ["stake"],
    mutationFn: stake,
    onSuccess: onStakeBTCSuccess,
    onError,
  })

  const onDepositBTCSuccess = useCallback(
    (transactionHash: string) => {
      dispatch(setTxHash(transactionHash))
      handleStake()
      handleCapture(PostHogEvent.DepositSuccess, {
        transactionHash,
      })
    },
    [dispatch, handleStake, handleCapture],
  )

  const onDepositBTCError = useCallback(
    (error: unknown) => {
      if (!sessionIdToPromise[sessionId.current].shouldOpenErrorModal) return

      if (eip1193.didUserRejectRequest(error)) {
        handlePause()
      } else {
        onError(error)
      }

      handleCaptureWithCause(error, PostHogEvent.DepositFailure)
    },
    [sessionIdToPromise, handlePause, onError, handleCaptureWithCause],
  )

  const { mutate: sendBitcoinTransaction, status } = useDepositBTCTransaction({
    onSuccess: onDepositBTCSuccess,
    onError: onDepositBTCError,
  })

  const handledDepositBTC = useCallback(async () => {
    if (!tokenAmount?.amount || !btcAddress || !depositReceipt) return
    const verificationStatus = await verifyDepositAddress(
      depositReceipt,
      btcAddress,
    )

    await resolve()

    if (verificationStatus === "valid") {
      sendBitcoinTransaction({
        recipient: btcAddress,
        amount: tokenAmount?.amount,
      })
    } else {
      onError("Invalid deposit address")
    }
  }, [
    tokenAmount?.amount,
    btcAddress,
    depositReceipt,
    verifyDepositAddress,
    resolve,
    sendBitcoinTransaction,
    onError,
  ])

  const handledDepositBTCWrapper = useCallback(() => {
    logPromiseFailure(handledDepositBTC())
  }, [handledDepositBTC])

  useTimeout(handledDepositBTCWrapper, ONE_SEC_IN_MILLISECONDS)

  if (status === "pending" || status === "success")
    return <WalletInteractionModal step="awaiting-transaction" />

  return <WalletInteractionModal step="opening-wallet" onClose={cancel} />
}
