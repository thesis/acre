import React from "react"
import ConnectWalletModal from "../Modals/ConnectWalletModal"
import StakingOverviewModal from "../Modals/StakingOverviewModal"
import { useRequestBitcoinAccount, useRequestEthereumAccount, useStakingFlowContext, useWalletContext } from "../../hooks"
import ModalOverlay from "../ModalOverlay"
import { HEADER_HEIGHT } from "../Header"
import Sidebar from "../Sidebar"
import StakeModal from "../Modals/StakeModal"
import { BITCOIN, ETHEREUM } from "../../constants"
import ConnectBTCAccount from "../../static/images/ConnectBTCAccount.png"
import ConnectETHAccount from "../../static/images/ConnectETHAccount.png"

function Modal() {
  const { modalType } = useStakingFlowContext()
  const { btcAccount, ethAccount } = useWalletContext()
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()
  const { requestAccount: requestEthereumAccount } = useRequestEthereumAccount()

  if (!modalType) return null

  if (!btcAccount)
    return (
      <ConnectWalletModal
        currency={BITCOIN}
        image={ConnectBTCAccount}
        requestAccount={requestBitcoinAccount}
      />
    )

  if (!ethAccount)
    return (
      <ConnectWalletModal
        currency={ETHEREUM}
        image={ConnectETHAccount}
        requestAccount={requestEthereumAccount}
      />
    )

  if (modalType === "overview") return <StakingOverviewModal />

  if (modalType === "stake") return <StakeModal />
}

export default function Staking() {
  return (
    <>
      <Modal />
      {/* The user has several modals in a flow.
      Let's use our own modal overlay to prevent the background flickering effect. */}
      <ModalOverlay marginTop={HEADER_HEIGHT} />
      <Sidebar marginTop={HEADER_HEIGHT} />
    </>
  )
}
