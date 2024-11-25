import React, { useCallback, useState } from "react"
import {
  useActionFlowTxHash,
  useAppDispatch,
  useStakeFlowContext,
} from "#/hooks"
import { PROCESS_STATUSES } from "#/types"
import { setStatus } from "#/store/action-flow"
import { UnexpectedErrorModalBase } from "#/components/UnexpectedErrorModal"
import { useMutation } from "@tanstack/react-query"
import ServerErrorModal from "./ServerErrorModal"
import RetryModal from "./RetryModal"

export default function StakingErrorModal({
  closeModal,
}: {
  closeModal: () => void
}) {
  const { stake } = useStakeFlowContext()
  const dispatch = useAppDispatch()
  const txHash = useActionFlowTxHash()

  const [isServerError, setIsServerError] = useState(false)

  const onStakeBTCSuccess = useCallback(() => {
    dispatch(setStatus(PROCESS_STATUSES.SUCCEEDED))
  }, [dispatch])

  const onStakeBTCError = useCallback(() => setIsServerError(true), [])

  const { mutate: handleStake, status } = useMutation({
    mutationKey: ["stake"],
    mutationFn: stake,
    onSuccess: onStakeBTCSuccess,
    onError: onStakeBTCError,
  })

  const isLoading = status === "pending"

  if (isServerError)
    return <ServerErrorModal retry={handleStake} isLoading={isLoading} />

  if (txHash) return <RetryModal isLoading={isLoading} retry={handleStake} />

  return <UnexpectedErrorModalBase closeModal={closeModal} withCloseButton />
}
