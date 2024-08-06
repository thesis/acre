import {
  useActionFlowStatus,
  useActionFlowTokenAmount,
  useActionFlowType,
  useModal,
} from "#/hooks"
import { PROCESS_STATUSES } from "#/types"
import React from "react"
import ActionFormModal from "./ActionFormModal"
import ErrorModal from "./ErrorModal"
import LoadingModal from "./LoadingModal"
import ResumeModal from "./ResumeModal"
import SuccessModal from "./SuccessModal"
import NotEnoughFundsModal from "./ActiveUnstakingStep/NotEnoughFundsModal"

export default function ModalContentWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const status = useActionFlowStatus()
  const type = useActionFlowType()
  const tokenAmount = useActionFlowTokenAmount()
  const { closeModal } = useModal()

  if (!tokenAmount || status === PROCESS_STATUSES.REFINE_AMOUNT)
    return <ActionFormModal type={type} />

  if (status === PROCESS_STATUSES.LOADING) return <LoadingModal />

  if (status === PROCESS_STATUSES.SUCCEEDED) return <SuccessModal type={type} />

  if (status === PROCESS_STATUSES.FAILED)
    return <ErrorModal type={type} closeModal={closeModal} />

  if (status === PROCESS_STATUSES.PAUSED) return <ResumeModal />

  if (status === PROCESS_STATUSES.NOT_ENOUGH_FUNDS)
    return <NotEnoughFundsModal />

  return children
}
