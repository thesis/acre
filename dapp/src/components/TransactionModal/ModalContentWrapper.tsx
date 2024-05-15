import React from "react"
import {
  useModalFlowContext,
  useRequestBitcoinAccount,
  useTransactionContext,
  useWalletContext,
} from "#/hooks"
import { BitcoinIcon } from "#/assets/icons"
import { ActionFlowType, PROCESS_STATUSES } from "#/types"
import { isSupportedBTCAddressType } from "#/utils"
import ActionFormModal from "./ActionFormModal"
import ErrorModal from "./ErrorModal"
import LoadingModal from "./LoadingModal"
import MissingAccountModal from "./MissingAccountModal"
import ResumeModal from "./ResumeModal"
import SuccessModal from "./SuccessModal"

export default function ModalContentWrapper({
  defaultType,
  children,
}: {
  defaultType: ActionFlowType
  children: React.ReactNode
}) {
  const { btcAccount } = useWalletContext()
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()
  const { type, status, onClose, onResume } = useModalFlowContext()
  const { tokenAmount } = useTransactionContext()

  if (!btcAccount || !isSupportedBTCAddressType(btcAccount.address))
    return (
      <MissingAccountModal
        currency="bitcoin"
        icon={BitcoinIcon}
        requestAccount={requestBitcoinAccount}
      />
    )

  if (!tokenAmount) return <ActionFormModal defaultType={defaultType} />

  if (status === PROCESS_STATUSES.PAUSED)
    return <ResumeModal onClose={onClose} onResume={onResume} />

  if (status === PROCESS_STATUSES.LOADING) return <LoadingModal />

  if (status === PROCESS_STATUSES.SUCCEEDED)
    return <SuccessModal type={type} tokenAmount={tokenAmount} />

  if (status === PROCESS_STATUSES.FAILED) return <ErrorModal type={type} />

  return children
}
