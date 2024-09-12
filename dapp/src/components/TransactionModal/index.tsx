import React, { useEffect } from "react"
import { StakeFlowProvider } from "#/contexts"
import {
  useAppDispatch,
  useConnector,
  useIsSignedMessage,
  useSidebar,
  useTransactionModal,
} from "#/hooks"
import { ACTION_FLOW_TYPES, ActionFlowType, BaseModalProps } from "#/types"
import { resetState, setType } from "#/store/action-flow"
import { featureFlags, wallets } from "#/constants"
import ModalContentWrapper from "./ModalContentWrapper"
import { ActiveFlowStep } from "./ActiveFlowStep"
import withBaseModal from "../ModalRoot/withBaseModal"
import { ConnectWalletModalBase } from "../ConnectWalletModal"

type TransactionModalProps = { type: ActionFlowType } & BaseModalProps

function TransactionModalBase({ type, closeModal }: TransactionModalProps) {
  const { onOpen: openSideBar, onClose: closeSidebar } = useSidebar()
  const dispatch = useAppDispatch()

  // TODO: Temporary solution - Should be removed when the error for Xverse is resolved.
  const isSignedMessage = useIsSignedMessage()
  const connector = useConnector()

  useEffect(() => {
    if (
      !featureFlags.XVERSE_WALLET_DEPOSIT_ENABLED &&
      type === ACTION_FLOW_TYPES.STAKE &&
      isSignedMessage &&
      connector?.id === wallets.XVERSE.id
    ) {
      closeModal()
    }
  }, [closeModal, connector?.id, isSignedMessage, type])

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
