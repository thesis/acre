import React from "react"
import {
  useActionFlowStatus,
  useActionFlowTokenAmount,
  useActionFlowTxHash,
  useActionFlowType,
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
  useWalletContext,
} from "#/hooks"
import { BitcoinIcon, EthereumIcon } from "#/assets/icons"
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
  const { btcAccount, ethAccount } = useWalletContext()
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()
  const { requestAccount: requestEthereumAccount } = useRequestEthereumAccount()
  const status = useActionFlowStatus()
  const type = useActionFlowType()
  const tokenAmount = useActionFlowTokenAmount()
  const txHash = useActionFlowTxHash()

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

  if (!tokenAmount) return <ActionFormModal type={type} />

  if (status === PROCESS_STATUSES.LOADING) return <LoadingModal />

  if (status === PROCESS_STATUSES.SUCCEEDED && txHash)
    return (
      <SuccessModal type={type} tokenAmount={tokenAmount} txHash={txHash} />
    )

  if (status === PROCESS_STATUSES.FAILED) return <ErrorModal type={type} />

  return children
}
