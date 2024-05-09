import React, { useEffect, useMemo } from "react"
import {
  ModalFlowContext,
  ModalFlowContextValue,
  StakeFlowProvider,
  TransactionContextProvider,
} from "#/contexts"
import { useSidebar } from "#/hooks"
import { ActionFlowType } from "#/types"
import { ModalCloseButton } from "@chakra-ui/react"
import { resetState, setType } from "#/store/action-flow"
import ModalBase from "../shared/ModalBase"
import ModalContentWrapper from "./ModalContentWrapper"
import { ActiveFlowStep } from "./ActiveFlowStep"

type TransactionModalProps = {
  type: ActionFlowType
  isOpen: boolean
  onClose: () => void
}

export default function TransactionModal({
  type,
  isOpen,
  onClose,
}: TransactionModalProps) {
  const { onOpen: openSideBar, onClose: closeSidebar } = useSidebar()

  useEffect(() => {
    setType(type)
  }, [type])

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isOpen) {
      openSideBar()
    } else {
      closeSidebar()
      timeout = setTimeout(resetState, 100)
    }
    return () => clearTimeout(timeout)
  }, [isOpen, openSideBar, closeSidebar])

  const contextValue: ModalFlowContextValue = useMemo<ModalFlowContextValue>(
    () => ({
      onClose,
    }),
    [onClose],
  )

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <TransactionContextProvider>
        <ModalFlowContext.Provider value={contextValue}>
          <StakeFlowProvider>
            <ModalContentWrapper>
              <ModalCloseButton />
              <ActiveFlowStep />
            </ModalContentWrapper>
          </StakeFlowProvider>
        </ModalFlowContext.Provider>
      </TransactionContextProvider>
    </ModalBase>
  )
}
