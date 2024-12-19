import React from "react"
import { ACTION_FLOW_STEPS_TYPES, ACTION_FLOW_TYPES } from "#/types"
import SignMessageModal from "./SignMessageModal"

const STEPS = ACTION_FLOW_STEPS_TYPES[ACTION_FLOW_TYPES.UNSTAKE]

export default function ActiveUnstakingStep({
  activeStep,
}: {
  activeStep: number
}) {
  switch (activeStep) {
    case STEPS.SIGN_MESSAGE:
      return <SignMessageModal />
    default:
      return null
  }
}
