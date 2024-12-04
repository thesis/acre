import React, { useEffect } from "react"
import { StakeFlowProvider } from "#/contexts"
import {
  useActivitiesQuery,
  useAppDispatch,
  useIsSignedMessage,
  useTransactionModal,
} from "#/hooks"
import { ActionFlowType, BaseModalProps } from "#/types"
import { resetState, setType } from "#/store/action-flow"
import { logPromiseFailure } from "#/utils"
import ModalContentWrapper from "./ModalContentWrapper"
import { ActiveFlowStep } from "./ActiveFlowStep"
import withBaseModal from "../ModalRoot/withBaseModal"
import { ConnectWalletModalBase } from "../ConnectWalletModal"

type TransactionModalProps = { type: ActionFlowType } & BaseModalProps

function TransactionModalBase({ type, closeModal }: TransactionModalProps) {
  const dispatch = useAppDispatch()
  const { refetch: refetchActivities } = useActivitiesQuery()

  useEffect(() => {
    dispatch(setType(type))
  }, [dispatch, type])

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      dispatch(resetState())
      logPromiseFailure(refetchActivities())
    }
  }, [dispatch, refetchActivities])

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
