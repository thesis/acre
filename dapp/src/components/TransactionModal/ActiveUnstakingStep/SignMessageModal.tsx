import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  useActionFlowPause,
  useActionFlowTokenAmount,
  useAppDispatch,
  useExecuteFunction,
  useInvalidateQueries,
  useModal,
  useTimeout,
  useTransactionDetails,
} from "#/hooks"
import { ACTION_FLOW_TYPES, PROCESS_STATUSES } from "#/types"
import { dateToUnixTimestamp, eip1193, logPromiseFailure } from "#/utils"
import { setStatus } from "#/store/action-flow"
import { useInitializeWithdraw } from "#/acre-react/hooks"
import { ONE_SEC_IN_MILLISECONDS, queryKeysFactory } from "#/constants"
import { activityInitialized } from "#/store/wallet"
import BuildTransactionModal from "./BuildTransactionModal"
import WalletInteractionModal from "../WalletInteractionModal"

const { userKeys } = queryKeysFactory

type WithdrawalStatus = "building-data" | "signature" | "transaction"

const sessionIdToPromise: Record<
  number,
  {
    promise: Promise<void>
    cancel: (reason: Error) => void
    shouldOpenErrorModal: boolean
  }
> = {}

export default function SignMessageModal() {
  const [status, setWaitingStatus] = useState<WithdrawalStatus>("building-data")

  const dispatch = useAppDispatch()
  const tokenAmount = useActionFlowTokenAmount()
  const amount = tokenAmount?.amount
  const { closeModal } = useModal()
  const { handlePause } = useActionFlowPause()
  const initializeWithdraw = useInitializeWithdraw()
  const handleBitcoinPositionInvalidation = useInvalidateQueries({
    queryKey: userKeys.position(),
  })
  const sessionId = useRef(Math.random())
  const { transactionFee } = useTransactionDetails(
    amount,
    ACTION_FLOW_TYPES.UNSTAKE,
  )

  useEffect(() => {
    let cancel = (_: Error) => {}
    const promise: Promise<void> = new Promise((_, reject) => {
      cancel = reject
    })

    sessionIdToPromise[sessionId.current] = {
      cancel,
      promise,
      shouldOpenErrorModal: true,
    }
  }, [])

  const builtDataStepCallback = useCallback(() => Promise.resolve(), [])

  const onSignMessageCallback = useCallback(async () => {
    setWaitingStatus("signature")
    return Promise.race([
      sessionIdToPromise[sessionId.current].promise,
      Promise.resolve(),
    ])
  }, [])

  const messageSignedCallback = useCallback(() => {
    setWaitingStatus("transaction")
    dispatch(setStatus(PROCESS_STATUSES.LOADING))
    return Promise.resolve()
  }, [dispatch])

  const onSignMessageSuccess = useCallback(() => {
    handleBitcoinPositionInvalidation()
    dispatch(setStatus(PROCESS_STATUSES.SUCCEEDED))
  }, [dispatch, handleBitcoinPositionInvalidation])

  const onSignMessageError = useCallback(() => {
    dispatch(setStatus(PROCESS_STATUSES.FAILED))
  }, [dispatch])

  const onError = useCallback(
    (error: unknown) => {
      if (!sessionIdToPromise[sessionId.current].shouldOpenErrorModal) return

      if (eip1193.didUserRejectRequest(error)) {
        handlePause()
      } else {
        onSignMessageError()
      }
    },
    [onSignMessageError, handlePause],
  )

  const handleSignMessage = useExecuteFunction(
    async () => {
      if (!amount) return

      const { redemptionKey } = await initializeWithdraw(
        amount,
        builtDataStepCallback,
        onSignMessageCallback,
        messageSignedCallback,
      )

      dispatch(
        activityInitialized({
          // Note that the withdraw id returned from the Acre SDK while fetching
          // the withdrawals has the following pattern:
          // `<redemptionKey>-<count>`. The redemption key returned during the
          // withdrawal initialization does not contain the `-<count>` suffix
          // because there may be delay between indexing the Acre subgraph and
          // the time when a transaction was actually made and it's hard to get
          // the exact number of the redemptions with the same key. Eg:
          // - a user initialized a withdraw,
          // - the Acre SDK is asking the subgraph for the number of withdrawals
          //   with the same redemption key,
          // - the Acre subgraph may or may not be up to date with the chain and
          //   we are not sure if we should add +1 to the counter or the
          //   returned value already includes the requested withdraw from the
          //   first step. So we can't create the correct withdraw id.
          // So here we set the id as a redemption key. Only one pending
          // withdrawal can exist with the same redemption key, so when the user
          // can initialize the next withdrawal with the same redemption key, we
          // assume the dapp should already re-fetch all withdrawals with the
          // correct IDs and move the `pending` redemption to `completed`
          // section with the proper id.
          id: redemptionKey,
          type: "withdraw",
          status: "pending",
          // This is a requested amount. The amount of BTC received will be
          // around: `amount - transactionFee.total`.
          amount: amount - transactionFee.acre,
          initializedAt: dateToUnixTimestamp(),
          // The message is signed immediately after the initialization.
          finalizedAt: dateToUnixTimestamp(),
        }),
      )
    },
    onSignMessageSuccess,
    onError,
  )

  const handleInitWithdrawAndSignMessageWrapper = useCallback(() => {
    logPromiseFailure(handleSignMessage())
  }, [handleSignMessage])

  const onClose = () => {
    const currentSessionId = sessionId.current
    const sessionData = sessionIdToPromise[currentSessionId]
    sessionIdToPromise[currentSessionId] = {
      ...sessionData,
      shouldOpenErrorModal: false,
    }

    sessionIdToPromise[currentSessionId].cancel(
      new Error("Withdrawal cancelled"),
    )
    closeModal()
  }

  useTimeout(handleInitWithdrawAndSignMessageWrapper, ONE_SEC_IN_MILLISECONDS)

  // TODO: This step should be split into several steps (building data and opening a wallet).
  if (status === "building-data")
    return <BuildTransactionModal onClose={onClose} />

  return <WalletInteractionModal step="awaiting-transaction" />
}
