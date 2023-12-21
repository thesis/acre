import React from "react"
import {
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
  useWalletContext,
} from "../../../hooks"
import MissingAccount from "./MissingAccount"
import { ConnectBTCAccount, ConnectETHAccount } from "../../../static/icons"

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
        currencyType="bitcoin"
        icon={ConnectBTCAccount}
        requestAccount={requestBitcoinAccount}
      />
    )

  if (!ethAccount)
    return (
      <MissingAccount
        currencyType="ethereum"
        icon={ConnectETHAccount}
        requestAccount={requestEthereumAccount}
      />
    )

  return children
}
