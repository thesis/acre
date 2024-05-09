import React, { useEffect } from "react"
import { StakeFlowProvider, TransactionContextProvider } from "#/contexts"
import { useSidebar } from "#/hooks"
import { ActionFlowType, BaseModalProps } from "#/types"
import { ModalCloseButton } from "@chakra-ui/react"
import { setType } from "#/store/action-flow"
import ModalContentWrapper from "./ModalContentWrapper"
import { ActiveFlowStep } from "./ActiveFlowStep"
import withBaseModal from "../ModalRoot/withBaseModal"

type TransactionModalProps = {
  type: ActionFlowType
} & BaseModalProps

function TransactionModalBase({ type }: TransactionModalProps) {
  const { onOpen: openSideBar, onClose: closeSidebar } = useSidebar()

  useEffect(() => {
    setType(type)
  }, [type])

  useEffect(() => {
    openSideBar()
    return () => closeSidebar()
  }, [closeSidebar, openSideBar])

  return (
    <TransactionContextProvider>
      <StakeFlowProvider>
        <ModalContentWrapper>
          <ModalCloseButton />
          <ActiveFlowStep />
        </ModalContentWrapper>
      </StakeFlowProvider>
    </TransactionContextProvider>
  )
}

const TransactionModal = withBaseModal(TransactionModalBase)
export default TransactionModal
