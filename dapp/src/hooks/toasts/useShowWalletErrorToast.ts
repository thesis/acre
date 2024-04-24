import { useCallback, useEffect } from "react"
import { ONE_SEC_IN_MILLISECONDS } from "#/constants"
import { capitalizeFirstLetter, logPromiseFailure } from "#/utils"
import { TOASTS, TOAST_IDS } from "#/types"
import { useToast } from "./useToast"
import { useWallet } from "../useWallet"
import { useTimeout } from "../useTimeout"

const { BITCOIN_WALLET_ERROR, ETHEREUM_WALLET_ERROR } = TOAST_IDS

const WALLET_ERROR_TOAST_ID = {
  bitcoin: {
    id: BITCOIN_WALLET_ERROR,
    Component: TOASTS[BITCOIN_WALLET_ERROR],
  },
  ethereum: {
    id: ETHEREUM_WALLET_ERROR,
    Component: TOASTS[ETHEREUM_WALLET_ERROR],
  },
}

export function useShowWalletErrorToast(
  type: "bitcoin" | "ethereum",
  delay = ONE_SEC_IN_MILLISECONDS,
) {
  const {
    [type]: { account, requestAccount },
  } = useWallet()
  const { closeToast, openToast } = useToast()

  const { id, Component } = WALLET_ERROR_TOAST_ID[type]

  const handleConnect = useCallback(
    () => logPromiseFailure(requestAccount()),
    [requestAccount],
  )

  const handleOpen = useCallback(
    () =>
      openToast({
        id,
        render: ({ onClose }) =>
          Component({
            title: capitalizeFirstLetter(`${type} wallet is not connected`),
            onClose,
            onClick: handleConnect,
          }),
      }),
    [Component, handleConnect, id, openToast, type],
  )

  useTimeout(handleOpen, delay)

  useEffect(() => {
    if (!account) return

    closeToast(id)
  }, [account, closeToast, id])
}
