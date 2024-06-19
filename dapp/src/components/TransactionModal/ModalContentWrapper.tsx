import {
  useActionFlowStatus,
  useActionFlowTokenAmount,
  useActionFlowType,
} from "#/hooks"
import { PROCESS_STATUSES } from "#/types"
import React from "react"
import ActionFormModal from "./ActionFormModal"
import ErrorModal from "./ErrorModal"
import LoadingModal from "./LoadingModal"
import ResumeModal from "./ResumeModal"
import SuccessModal from "./SuccessModal"

export default function ModalContentWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const status = useActionFlowStatus()
  const type = useActionFlowType()
  const tokenAmount = useActionFlowTokenAmount()

  if (!tokenAmount) return <ActionFormModal type={type} />

  if (status === PROCESS_STATUSES.LOADING) return <LoadingModal />

  if (status === PROCESS_STATUSES.SUCCEEDED) return <SuccessModal type={type} />

  if (status === PROCESS_STATUSES.FAILED) return <ErrorModal type={type} />

  if (status === PROCESS_STATUSES.PAUSED) return <ResumeModal />

  return children
}
