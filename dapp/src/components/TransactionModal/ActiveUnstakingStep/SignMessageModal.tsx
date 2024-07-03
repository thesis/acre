import React, { useCallback, useState } from "react"
import {
  useActionFlowPause,
  useActionFlowTokenAmount,
  useAppDispatch,
  useExecuteFunction,
  useInvalidateQueries,
  useModal,
} from "#/hooks"
import { PROCESS_STATUSES } from "#/types"
import { Button } from "@chakra-ui/react"
import { eip1193, logPromiseFailure } from "#/utils"
import { setStatus } from "#/store/action-flow"
import { useInitializeWithdraw } from "#/acre-react/hooks"
import TriggerTransactionModal from "../TriggerTransactionModal"

type WithdrawalStatus = "building-data" | "signature" | "transaction"

const withdrawalStatusToContent: Record<
  WithdrawalStatus,
  { title: string; subtitle: string }
> = {
  "building-data": {
    title: "Building transaction data...",
    subtitle: "We are building your withdrawal data.",
  },
  signature: {
    title: "Waiting signature...",
    subtitle: "Please complete the signing process in your wallet.",
  },
  transaction: {
    title: "Waiting for withdrawal initialization...",
    subtitle: "Withdrawal initialization in progress...",
  },
}

export default function SignMessageModal() {
  const [status, setWaitingStatus] = useState<WithdrawalStatus>("building-data")

  const dispatch = useAppDispatch()
  const tokenAmount = useActionFlowTokenAmount()
  const amount = tokenAmount?.amount
  const { closeModal } = useModal()
  const { handlePause } = useActionFlowPause()
  const initializeWithdraw = useInitializeWithdraw()

  const onSignMessageCallback = useCallback(async () => {
    setWaitingStatus("signature")
    return Promise.resolve()
  }, [])

  const messageSignedCallback = useCallback(() => {
    setWaitingStatus("transaction")
    dispatch(setStatus(PROCESS_STATUSES.LOADING))
    return Promise.resolve()
  }, [dispatch])

  const onSignMessageSuccess = useCallback(() => {
    dispatch(setStatus(PROCESS_STATUSES.SUCCEEDED))
  }, [dispatch])

  const onSignMessageError = useCallback(() => {
    dispatch(setStatus(PROCESS_STATUSES.FAILED))
  }, [dispatch])

  const onError = useCallback(
    (error: unknown) => {
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

      await initializeWithdraw(
        amount,
        onSignMessageCallback,
        messageSignedCallback,
      )
    },
    onSignMessageSuccess,
    onError,
  )

  const handleInitWithdrawAndSignMessageWrapper = useCallback(() => {
    logPromiseFailure(handleSignMessage())
  }, [handleSignMessage])

  const { title, subtitle } = withdrawalStatusToContent[status]

  return (
    <TriggerTransactionModal
      title={title}
      subtitle={subtitle}
      callback={handleInitWithdrawAndSignMessageWrapper}
    >
      <Button size="lg" width="100%" variant="outline" onClick={closeModal}>
        Cancel
      </Button>
    </TriggerTransactionModal>
  )
}
