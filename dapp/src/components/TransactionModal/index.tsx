import React, { useEffect } from "react"
import { StakeFlowProvider } from "#/contexts"
import { useAppDispatch, useSidebar } from "#/hooks"
import { ActionFlowType, BaseModalProps } from "#/types"
import { ModalCloseButton } from "@chakra-ui/react"
import { resetState, setType } from "#/store/action-flow"
import ModalContentWrapper from "./ModalContentWrapper"
import { ActiveFlowStep } from "./ActiveFlowStep"
import withBaseModal from "../ModalRoot/withBaseModal"

type TransactionModalProps = {
  type: ActionFlowType
} & BaseModalProps

function TransactionModalBase({ type }: TransactionModalProps) {
  const { onOpen: openSideBar, onClose: closeSidebar } = useSidebar()
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setType(type))
  }, [dispatch, type])

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      dispatch(resetState())
    }
  }, [dispatch])

  useEffect(() => {
    openSideBar()
    return () => closeSidebar()
  }, [closeSidebar, openSideBar])

  return (
    <StakeFlowProvider>
      <ModalContentWrapper>
        <ModalCloseButton />
        <ActiveFlowStep />
      </ModalContentWrapper>
    </StakeFlowProvider>
  )
}

const TransactionModal = withBaseModal(TransactionModalBase)
export default TransactionModal
