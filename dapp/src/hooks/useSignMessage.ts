import { STATUSES, Status } from "#/types"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSignMessage as useWagmiSignMessage } from "wagmi"
import { SignMessageMutate } from "wagmi/query"

type SignMessageParams = Parameters<SignMessageMutate<unknown>>

type UseSignMessageReturn = {
  status: Status
  signMessage: (...params: SignMessageParams) => void
}

export function useSignMessage(): UseSignMessageReturn {
  const { signMessage, status: signMessageStatus } = useWagmiSignMessage()

  const [status, setStatus] = useState<Status>(STATUSES.IDLE)

  const handleSignMessage = useCallback(
    (...params: SignMessageParams) => {
      setStatus(STATUSES.PENDING)
      signMessage(...params)
    },
    [signMessage],
  )

  useEffect(() => {
    if (signMessageStatus === "error") setStatus(STATUSES.ERROR)
    if (signMessageStatus === "success") setStatus(STATUSES.SUCCESS)
  }, [signMessageStatus])

  return useMemo(
    () => ({
      status,
      signMessage: handleSignMessage,
    }),
    [handleSignMessage, status],
  )
}
