import { ActionFlowType, MODAL_TYPES } from "#/types"
import { useCallback, useEffect } from "react"
import { logPromiseFailure } from "#/utils"
import { useModal } from "./useModal"
import { useWalletContext } from "./useWalletContext"
import { useRequestBitcoinAccount } from "./ledger-live/useRequestBitcoinAccount"

export function useTransactionModal(type: ActionFlowType) {
  const { btcAccount } = useWalletContext()
  const { account, requestAccount } = useRequestBitcoinAccount()
  const { openModal } = useModal()

  const handleOpenModal = useCallback(() => {
    openModal(MODAL_TYPES[type], { type })
  }, [openModal, type])

  useEffect(() => {
    // We should check the `account` here from `useRequestBitcoinAccount`.
    // This will allow us to check there whether the account request action
    // called earlier was successful.
    // Checking the `btcAccount` may trigger a not needed modal opening.
    if (account) {
      handleOpenModal()
    }
  }, [account, handleOpenModal])

  return useCallback(() => {
    if (btcAccount) {
      handleOpenModal()
    } else {
      logPromiseFailure(requestAccount())
    }
  }, [btcAccount, handleOpenModal, requestAccount])
}
