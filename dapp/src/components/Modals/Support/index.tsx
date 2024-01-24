import React from "react"
import {
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
  useWalletContext,
} from "#/hooks"
import { ConnectBTCAccount, ConnectETHAccount } from "#/assets/icons"
import MissingAccount from "./MissingAccount"

export default function SupportWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { btcAccount, ethAccount } = useWalletContext()
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()
  const { requestAccount: requestEthereumAccount } = useRequestEthereumAccount()

  if (!btcAccount)
    return (
      <MissingAccount
        currency="bitcoin"
        icon={ConnectBTCAccount}
        requestAccount={requestBitcoinAccount}
      />
    )

  if (!ethAccount)
    return (
      <MissingAccount
        currency="ethereum"
        icon={ConnectETHAccount}
        requestAccount={requestEthereumAccount}
      />
    )

  return children
}
