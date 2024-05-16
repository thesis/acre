import { ActionFlowType, MODAL_TYPES } from "#/types"
import { useCallback, useEffect } from "react"
import { logPromiseFailure } from "#/utils"
import { ZeroAddress } from "ethers"
import { useModal } from "./useModal"
import { useWalletContext } from "./useWalletContext"
import { useRequestBitcoinAccount } from "./useRequestBitcoinAccount"

export function useTransactionModal(type: ActionFlowType) {
  const { btcAccount, setEthAccount } = useWalletContext()
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
  }, [account, handleOpenModal, openModal, type])

  const handleRequestAccount = useCallback(async () => {
    await requestAccount()
    // TODO: Temporary solution - we do not need the eth account and we
    // want to create the Acre SDK w/o passing the Ethereum Account.
    setEthAccount(ZeroAddress)
  }, [requestAccount, setEthAccount])

  return useCallback(() => {
    if (btcAccount) {
      handleOpenModal()
    } else {
      logPromiseFailure(handleRequestAccount())
    }
  }, [btcAccount, handleOpenModal, handleRequestAccount])
}
