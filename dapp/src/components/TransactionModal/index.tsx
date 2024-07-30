import React, { useEffect } from "react"
import { StakeFlowProvider } from "#/contexts"
import {
  useAppDispatch,
  useIsSignedMessage,
  useModal,
  useSidebar,
  useTransactionModal,
} from "#/hooks"
import { ActionFlowType, BaseModalProps } from "#/types"
import { resetState, setType } from "#/store/action-flow"
import ModalContentWrapper from "./ModalContentWrapper"
import { ActiveFlowStep } from "./ActiveFlowStep"
import withBaseModal from "../ModalRoot/withBaseModal"
import { ConnectWalletModalBase } from "../ConnectWalletModal"

type TransactionModalProps = {
  type: ActionFlowType
}

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
        <ActiveFlowStep />
      </ModalContentWrapper>
    </StakeFlowProvider>
  )
}

function TransactionModalWrapper({
  type,
}: TransactionModalProps & BaseModalProps) {
  const openModal = useTransactionModal(type)
  const { closeModal } = useModal()
  const isSignedMessage = useIsSignedMessage()

  if (isSignedMessage) return <TransactionModalBase type={type} />

  return (
    <ConnectWalletModalBase onSuccess={openModal} closeModal={closeModal} />
  )
}

const TransactionModal = withBaseModal(TransactionModalWrapper)
export default TransactionModal
