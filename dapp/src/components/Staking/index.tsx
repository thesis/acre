import React from "react"
import ConnectWalletModal from "../Modals/ConnectWalletModal"
import StakingOverviewModal from "../Modals/StakingOverviewModal"
import { useStakingFlowContext, useWalletContext } from "../../hooks"
import ModalOverlay from "../ModalOverlay"
import { HEADER_HEIGHT } from "../Header"
import Sidebar from "../Sidebar"
import StakeModal from "../Modals/StakeModal"

function Modal() {
  const { modalType } = useStakingFlowContext()
  const { btcAccount } = useWalletContext()

  if (!modalType) return null

  if (!btcAccount) return <ConnectWalletModal />

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
