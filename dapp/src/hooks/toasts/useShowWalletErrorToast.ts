import { useCallback, useEffect } from "react"
import { ONE_SEC_IN_MILLISECONDS } from "#/constants"
import { capitalizeFirstLetter, logPromiseFailure } from "#/utils"
import WalletErrorToast, {
  WALLET_ERROR_TOAST_ID,
} from "#/components/WalletErrorToast"
import { useToast } from "./useToast"
import { useWallet } from "../useWallet"
import { useTimeout } from "../useTimeout"

export function useShowWalletErrorToast(
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

  const handleOpen = useCallback(
    () =>
      open({
        id: toastId,
        render: ({ onClose }) =>
          WalletErrorToast({
            title: capitalizeFirstLetter(`${type} wallet is not connected`),
            onClose,
            onClick: handleConnect,
          }),
      }),
    [handleConnect, open, toastId, type],
  )

  useTimeout(handleOpen, delay)

  useEffect(() => {
    if (!account) return

    close(toastId)
  }, [account, close, toastId])
}
