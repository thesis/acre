import React from "react"
import { TextLg } from "#/components/shared/Typography"
import { ACTION_FLOW_STEPS_TYPES, ACTION_FLOW_TYPES } from "#/types"

const STEPS = ACTION_FLOW_STEPS_TYPES[ACTION_FLOW_TYPES.UNSTAKE]

export function ActiveUnstakingStep({ activeStep }: { activeStep: number }) {
  switch (activeStep) {
    case STEPS.SIGN_MESSAGE:
      return <TextLg>Unstaking Flow</TextLg>
    default:
      return null
  }
}
