import { useCallback, useEffect } from "react"
import { ONE_SEC_IN_MILLISECONDS } from "#/constants"
import { logPromiseFailure } from "#/utils"
import { TOAST_TYPES } from "#/types"
import { TOASTS } from "#/components/shared/toasts"
import { useToast } from "./useToast"
import { useWallet } from "./useWallet"

const WALLET_ERROR_TOAST_ID = {
  bitcoin: TOAST_TYPES.BITCOIN_WALLET_NOT_CONNECTED_ERROR,
  ethereum: TOAST_TYPES.ETHEREUM_WALLET_NOT_CONNECTED_ERROR,
}

export function useWalletToast(
  type: "bitcoin" | "ethereum",
  delay = ONE_SEC_IN_MILLISECONDS,
) {
  const {
    [type]: { account, requestAccount },
  } = useWallet()
  const { close, open } = useToast()

  const toastId = WALLET_ERROR_TOAST_ID[type]

  const handleConnect = useCallback(
    () => logPromiseFailure(requestAccount()),
    [requestAccount],
  )

  useEffect(() => {
    const timeout = setTimeout(
      () =>
        open(
          TOASTS[toastId]({
            onClick: handleConnect,
          }),
        ),
      delay,
    )

    return () => clearTimeout(timeout)
  }, [delay, handleConnect, open, toastId, type])

  useEffect(() => {
    if (!account) return

    close(toastId)
  }, [account, close, toastId])
}
