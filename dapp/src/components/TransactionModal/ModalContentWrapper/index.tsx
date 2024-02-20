import React from "react"
import {
  useModalFlowContext,
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
  useTransactionContext,
  useWalletContext,
} from "#/hooks"
import { ConnectBTCAccount, ConnectETHAccount } from "#/assets/icons"
import { ActionFlowType, PROCESS_STATUSES } from "#/types"
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
  const { type, status, onClose, onResume } = useModalFlowContext()
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

  if (status === PROCESS_STATUSES.PAUSED)
    return <ResumeModal onClose={onClose} onResume={onResume} />

  if (status === PROCESS_STATUSES.LOADING) return <LoadingModal />

  if (status === PROCESS_STATUSES.SUCCEEDED)
    return <SuccessModal type={type} tokenAmount={tokenAmount} />

  return children
}
