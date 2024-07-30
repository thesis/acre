import React, { useEffect } from "react"
import { StakeFlowProvider } from "#/contexts"
import {
  useAppDispatch,
  useIsSignedMessage,
  useSidebar,
  useTransactionModal,
} from "#/hooks"
import { ActionFlowType, BaseModalProps } from "#/types"
import { ModalCloseButton } from "@chakra-ui/react"
import { resetState, setType } from "#/store/action-flow"
import ModalContentWrapper from "./ModalContentWrapper"
import { ActiveFlowStep } from "./ActiveFlowStep"
import withBaseModal from "../ModalRoot/withBaseModal"
import { ConnectWalletModalBase } from "../ConnectWalletModal"

type TransactionModalProps = { type: ActionFlowType } & BaseModalProps

function TransactionModalBase({ type, closeModal }: TransactionModalProps) {
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
      <ModalContentWrapper closeModal={closeModal}>
        <ModalCloseButton />
        <ActiveFlowStep />
      </ModalContentWrapper>
    </StakeFlowProvider>
  )
}

function TransactionModalWrapper({ type, closeModal }: TransactionModalProps) {
  const openModal = useTransactionModal(type)
  const isSignedMessage = useIsSignedMessage()

  if (isSignedMessage)
    return <TransactionModalBase type={type} closeModal={closeModal} />

  return (
    <ConnectWalletModalBase onSuccess={openModal} closeModal={closeModal} />
  )
}

const TransactionModal = withBaseModal(TransactionModalWrapper)
export default TransactionModal
