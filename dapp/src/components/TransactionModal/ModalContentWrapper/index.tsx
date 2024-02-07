import React from "react"
import {
  useModalFlowContext,
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
  useTransactionContext,
  useWalletContext,
} from "#/hooks"
import { ConnectBTCAccount, ConnectETHAccount } from "#/assets/icons"
import { ActionFlowType, TRANSACTION_STATUSES } from "#/types"
import ActionFormModal from "./ActionFormModal"
import MissingAccountModal from "./MissingAccountModal"
import ResumeModal from "./ResumeModal"
import SuccessModal from "./SuccessModal"
import LoadingModal from "./LoadingModal"

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
  const { type, isPaused, onClose, onResume } = useModalFlowContext()
  const { tokenAmount, status } = useTransactionContext()

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

  if (isPaused) {
    return <ResumeModal onClose={onClose} onResume={onResume} />
  }

  if (!tokenAmount) return <ActionFormModal defaultType={defaultType} />

  if (status === TRANSACTION_STATUSES.SUCCEEDED)
    return <SuccessModal type={type} tokenAmount={tokenAmount} />

  if (status === TRANSACTION_STATUSES.PENDING) return <LoadingModal />

  return children
}
