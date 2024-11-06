import React, { useCallback, useState } from "react"
import {
  useActionFlowTxHash,
  useAppDispatch,
  useExecuteFunction,
  useStakeFlowContext,
} from "#/hooks"
import { PROCESS_STATUSES } from "#/types"
import { logPromiseFailure } from "#/utils"
import { setStatus } from "#/store/action-flow"
import { UnexpectedErrorModalBase } from "#/components/UnexpectedErrorModal"
import ServerErrorModal from "./ServerErrorModal"
import RetryModal from "./RetryModal"
import LoadingModal from "../../LoadingModal"

export default function StakingErrorModal({
  closeModal,
}: {
  closeModal: () => void
}) {
  const { stake } = useStakeFlowContext()
  const dispatch = useAppDispatch()
  const txHash = useActionFlowTxHash()

  const [isLoading, setIsLoading] = useState(false)
  const [isServerError, setIsServerError] = useState(false)

  const onStakeBTCSuccess = useCallback(() => {
    dispatch(setStatus(PROCESS_STATUSES.SUCCEEDED))
  }, [dispatch])

  const onStakeBTCError = useCallback(() => setIsServerError(true), [])

  const handleStake = useExecuteFunction(
    stake,
    onStakeBTCSuccess,
    onStakeBTCError,
  )

  const handleRetry = useCallback(async () => {
    setIsLoading(true)
    await handleStake()
    setIsLoading(false)
  }, [handleStake])

  const handleRetryWrapper = useCallback(
    () => logPromiseFailure(handleRetry()),
    [handleRetry],
  )

  if (isServerError)
    return <ServerErrorModal retry={handleRetryWrapper} isLoading={isLoading} />

  if (isLoading) return <LoadingModal />

  if (txHash) return <RetryModal retry={handleRetryWrapper} />

  return <UnexpectedErrorModalBase closeModal={closeModal} withCloseButton />
}
