import React from "react"
import {
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
  useTransactionContext,
  useWalletContext,
} from "#/hooks"
import { ConnectBTCAccount, ConnectETHAccount } from "#/assets/icons"
import { ActionFlowType } from "#/types"
import ActionFormModal from "./ActionFormModal"
import MissingAccountModal from "./MissingAccountModal"

export default function ModalContentWrapper({
  defaultType,
  children,
}: {
  defaultType: ActionFlowType
  children: React.ReactNode
}) {
  const { btcAccount, ethAccount } = useWalletContext()
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()
  const { requestAccount: requestEthereumAccount } = useRequestEthereumAccount()
  const { tokenAmount } = useTransactionContext()

  if (!btcAccount)
    return (
      <MissingAccountModal
        currency="bitcoin"
        icon={ConnectBTCAccount}
        requestAccount={requestBitcoinAccount}
      />
    )

  if (!ethAccount)
    return (
      <MissingAccountModal
        currency="ethereum"
        icon={ConnectETHAccount}
        requestAccount={requestEthereumAccount}
      />
    )

  if (!tokenAmount) return <ActionFormModal defaultType={defaultType} />

  return children
}
