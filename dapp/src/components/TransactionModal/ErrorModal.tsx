import React from "react"
import { ACTION_FLOW_TYPES, ActionFlowType } from "#/types"
import StakingErrorModal from "./ActiveStakingStep/StakingErrorModal"
import { UnexpectedErrorModalBase } from "../UnexpectedErrorModal"

export default function ErrorModal({
  type,
  closeModal,
}: {
  type: ActionFlowType
  closeModal: () => void
}) {
  if (type === ACTION_FLOW_TYPES.STAKE)
    return <StakingErrorModal closeModal={closeModal} />
  return <UnexpectedErrorModalBase closeModal={closeModal} withCloseButton />
}
