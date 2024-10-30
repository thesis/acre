import {
  useActionFlowStatus,
  useActionFlowTokenAmount,
  useActionFlowType,
} from "#/hooks"
import { BaseModalProps, PROCESS_STATUSES } from "#/types"
import React from "react"
import ActionFormModal from "./ActionFormModal"
import ErrorModal from "./ErrorModal"
import ResumeModal from "./ResumeModal"
import SuccessModal from "./SuccessModal"
import NotEnoughFundsModal from "./ActiveUnstakingStep/NotEnoughFundsModal"

export default function ModalContentWrapper({
  closeModal,
  children,
}: {
  children: React.ReactNode
} & BaseModalProps) {
  const status = useActionFlowStatus()
  const type = useActionFlowType()
  const tokenAmount = useActionFlowTokenAmount()

  if (!tokenAmount || status === PROCESS_STATUSES.REFINE_AMOUNT)
    return <ActionFormModal type={type} />

  if (status === PROCESS_STATUSES.SUCCEEDED) return <SuccessModal type={type} />

  if (status === PROCESS_STATUSES.FAILED)
    return <ErrorModal type={type} closeModal={closeModal} />

  if (status === PROCESS_STATUSES.PAUSED)
    return <ResumeModal closeModal={closeModal} />

  if (status === PROCESS_STATUSES.NOT_ENOUGH_FUNDS)
    return <NotEnoughFundsModal />

  return children
}
