import React from "react"
import { ACTION_FLOW_STEPS_TYPES } from "#/types"
import SignMessageModal from "./SignMessageModal"
import DepositBTCModal from "./DepositBTCModal"
import OverviewModal from "./OverviewModal"

const STEPS = ACTION_FLOW_STEPS_TYPES.stake

export function ActiveStakingStep({ activeStep }: { activeStep: number }) {
  switch (activeStep) {
    case STEPS.OVERVIEW:
      return <OverviewModal />
    case STEPS.SIGN_MESSAGE:
      return <SignMessageModal />
    case STEPS.DEPOSIT_BTC:
      return <DepositBTCModal />
    default: {
      return null
    }
  }
}
