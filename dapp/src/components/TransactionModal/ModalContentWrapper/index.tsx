import React from "react"
import {
  useModalFlowContext,
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
  useTransactionContext,
  useWalletContext,
} from "#/hooks"
import { BitcoinIcon, EthereumIcon } from "#/assets/icons"
import { ActionFlowType, PROCESS_STATUSES } from "#/types"
import { isSupportedBTCAddressType } from "#/utils"
import ActionFormModal from "./ActionFormModal"
import MissingAccountModal from "./MissingAccountModal"
import ResumeModal from "./ResumeModal"
import SuccessModal from "./SuccessModal"
import LoadingModal from "./LoadingModal"
import ErrorModal from "./ErrorModal"

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

  if (!btcAccount || !isSupportedBTCAddressType(btcAccount.address))
    return (
      <MissingAccountModal
        currency="bitcoin"
        icon={BitcoinIcon}
        requestAccount={requestBitcoinAccount}
      />
    )

  if (!ethAccount)
    return (
      <MissingAccountModal
        currency="ethereum"
        icon={EthereumIcon}
        requestAccount={requestEthereumAccount}
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
