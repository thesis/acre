import React from "react"
import {
  useModalFlowContext,
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
  useWalletContext,
} from "#/hooks"
import { ConnectBTCAccount, ConnectETHAccount } from "#/static/icons"
import MissingAccount from "./MissingAccount"
import Resume from "../Staking/Resume"

export default function SupportWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { btcAccount, ethAccount } = useWalletContext()
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()
  const { requestAccount: requestEthereumAccount } = useRequestEthereumAccount()
  const { isResumeStep, onClose, onResume } = useModalFlowContext()
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

  if (isResumeStep) {
    return <Resume onClose={onClose} onResume={onResume} />
  }

  return children
}
