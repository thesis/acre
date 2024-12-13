import React from "react"
import { ACTION_FLOW_STEPS_TYPES, ACTION_FLOW_TYPES } from "#/types"
import DepositBTCModal from "./DepositBTCModal"

const STEPS = ACTION_FLOW_STEPS_TYPES[ACTION_FLOW_TYPES.STAKE]

export default function ActiveStakingStep({
  activeStep,
}: {
  activeStep: number
}) {
  switch (activeStep) {
    case STEPS.DEPOSIT_BTC:
      return <DepositBTCModal />
    default: {
      return null
    }
  }
}
