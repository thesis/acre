import React from "react"
import {
  useActionFlowStatus,
  useActionFlowTokenAmount,
  useActionFlowType,
  useRequestBitcoinAccount,
  useWalletContext,
} from "#/hooks"
import { BitcoinIcon } from "#/assets/icons"
import { PROCESS_STATUSES } from "#/types"
import { isSupportedBTCAddressType } from "#/utils"
import ActionFormModal from "./ActionFormModal"
import ErrorModal from "./ErrorModal"
import LoadingModal from "./LoadingModal"
import MissingAccountModal from "./MissingAccountModal"
import SuccessModal from "./SuccessModal"

export default function ModalContentWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { btcAccount } = useWalletContext()
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()
  const status = useActionFlowStatus()
  const type = useActionFlowType()
  const tokenAmount = useActionFlowTokenAmount()

  if (!btcAccount || !isSupportedBTCAddressType(btcAccount.address))
    return (
      <MissingAccountModal
        currency="bitcoin"
        icon={BitcoinIcon}
        requestAccount={requestBitcoinAccount}
      />
    )

  if (!tokenAmount) return <ActionFormModal type={type} />

  if (status === PROCESS_STATUSES.LOADING) return <LoadingModal />

  if (status === PROCESS_STATUSES.SUCCEEDED)
    return <SuccessModal type={type} tokenAmount={tokenAmount} />

  if (status === PROCESS_STATUSES.FAILED) return <ErrorModal type={type} />

  return children
}
