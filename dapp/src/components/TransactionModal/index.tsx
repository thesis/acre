import React, { useEffect } from "react"
import {
  ModalFlowContextProvider,
  TransactionContextProvider,
} from "#/contexts"
import { ActionFlowType } from "#/types"
import { useSidebar } from "#/hooks"
import ModalBase from "../shared/ModalBase"
import ModalContentWrapper from "./ModalContentWrapper"
import { ActiveFlowStep } from "./ActiveFlowStep"

export default function TransactionModal({
  isOpen,
  onClose,
  defaultType = "stake",
}: {
  isOpen: boolean
  onClose: () => void
  defaultType?: ActionFlowType
}) {
  const { onOpen: openSideBar, onClose: closeSidebar } = useSidebar()

  useEffect(() => {
    if (isOpen) {
      openSideBar()
    } else {
      closeSidebar()
    }
  }, [closeSidebar, isOpen, openSideBar])

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <TransactionContextProvider>
        <ModalFlowContextProvider defaultType={defaultType} onClose={onClose}>
          <ModalContentWrapper defaultType={defaultType}>
            <ActiveFlowStep />
          </ModalContentWrapper>
        </ModalFlowContextProvider>
      </TransactionContextProvider>
    </ModalBase>
  )
}
