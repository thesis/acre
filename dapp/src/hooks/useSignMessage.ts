import { useSignMessage as useSignMessageLedgerLive } from "@ledgerhq/wallet-api-client-react"
import { useCallback, useEffect } from "react"
import { OnSuccessCallback } from "#/types"
import { useWalletContext } from "./useWalletContext"

const SIGN_MESSAGE = "Test message"

export function useSignMessage(onSuccess?: OnSuccessCallback) {
  const { ethAccount } = useWalletContext()
  const { signMessage, signature } = useSignMessageLedgerLive()

  useEffect(() => {
    if (signature && onSuccess) {
      onSuccess()
    }
  }, [onSuccess, signature])

  // TODO: signing message using the SDK
  const handleSignMessage = useCallback(async () => {
    if (!ethAccount?.id) return

    await signMessage(ethAccount.id, Buffer.from(SIGN_MESSAGE, "utf-8"))
  }, [ethAccount, signMessage])

  return { signMessage: handleSignMessage }
}
