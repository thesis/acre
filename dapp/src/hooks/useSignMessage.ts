import {
  OnErrorCallback,
  OnSuccessCallback,
  OrangeKitConnector,
  Status,
} from "#/types"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSignMessage as useWagmiSignMessage } from "wagmi"
import { SignMessageMutate } from "wagmi/query"
import { orangeKit } from "#/utils"
import { useWallet } from "./useWallet"

type SignMessageParams = Omit<
  Parameters<SignMessageMutate<unknown>>[0],
  "connector"
> & {
  connector: OrangeKitConnector
}
type SignMessageOptions = {
  onSuccess?: OnSuccessCallback
  onError?: OnErrorCallback
}

type UseSignMessageReturn = {
  status: Status
  signMessage: (params: SignMessageParams, options?: SignMessageOptions) => void
}

export function useSignMessage(): UseSignMessageReturn {
  const { isConnected } = useWallet()
  const { signMessage } = useWagmiSignMessage()

  const [status, setStatus] = useState<Status>("idle")

  const handleSignMessage = useCallback(
    (params: SignMessageParams, options?: SignMessageOptions) => {
      setStatus("pending")
      const updatedPrams = {
        ...params,
        connector: orangeKit.typeConversionToConnector(params.connector),
      }
      signMessage(updatedPrams, {
        onError: (error) => {
          setStatus("error")
          if (options?.onError) options.onError(error)
        },
        onSuccess: () => {
          setStatus("success")
          if (options?.onSuccess) options.onSuccess()
        },
      })
    },
    [signMessage],
  )

  useEffect(() => {
    if (isConnected) return

    setStatus("idle")
  }, [isConnected])

  return useMemo(
    () => ({
      status,
      signMessage: handleSignMessage,
    }),
    [handleSignMessage, status],
  )
}
