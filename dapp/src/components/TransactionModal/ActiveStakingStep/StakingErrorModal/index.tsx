import React, { useCallback, useState } from "react"
import {
  useAppDispatch,
  useExecuteFunction,
  useFetchDeposits,
  useStakeFlowContext,
} from "#/hooks"
import { PROCESS_STATUSES } from "#/types"
import { logPromiseFailure } from "#/utils"
import { setStatus } from "#/store/action-flow"
import ServerErrorModal from "./ServerErrorModal"
import RetryModal from "./RetryModal"
import LoadingModal from "../../LoadingModal"

export default function StakingErrorModal() {
  const { stake } = useStakeFlowContext()
  const dispatch = useAppDispatch()
  const fetchDeposits = useFetchDeposits()

  const [isLoading, setIsLoading] = useState(false)
  const [isServerError, setIsServerError] = useState(false)

  const onStakeBTCSuccess = useCallback(() => {
    fetchDeposits()
    dispatch(setStatus(PROCESS_STATUSES.SUCCEEDED))
  }, [dispatch, fetchDeposits])

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

  return <RetryModal retry={handleRetryWrapper} />
}
