import React, { ElementType } from "react"
import { useModal } from "#/hooks"
import { ModalType } from "#/types"
import TransactionModal from "../TransactionModal"
import WelcomeModal from "../WelcomeModal"
import MezoBeehiveModal from "../MezoBeehiveModal"
import ConnectWalletModal from "../ConnectWalletModal"
import UnexpectedErrorModal from "../UnexpectedErrorModal"

const MODALS: Record<ModalType, ElementType> = {
  STAKE: TransactionModal,
  UNSTAKE: TransactionModal,
  WELCOME: WelcomeModal,
  MEZO_BEEHIVE: MezoBeehiveModal,
  CONNECT_WALLET: ConnectWalletModal,
  UNEXPECTED_ERROR: UnexpectedErrorModal,
} as const

export default function ModalRoot() {
  const { modalType, modalProps, closeModal } = useModal()

  if (!modalType) {
    return null
  }
  const SpecificModal = MODALS[modalType]
  return <SpecificModal closeModal={closeModal} {...modalProps} />
}
