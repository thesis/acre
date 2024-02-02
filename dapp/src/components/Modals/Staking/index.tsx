import React from "react"
import { ACTION_FLOW_STEPS_TYPES, ACTION_FLOW_TYPES } from "#/types"
import Overview from "./Overview"
import SignMessage from "./SignMessage"
import DepositBTC from "./DepositBTC"

const STEPS = ACTION_FLOW_STEPS_TYPES[ACTION_FLOW_TYPES.STAKE]

export function ActiveStakingStep({ activeStep }: { activeStep: number }) {
  switch (activeStep) {
    case STEPS.OVERVIEW:
      return <Overview />
    case STEPS.SIGN_MESSAGE:
      return <SignMessage />
    case STEPS.DEPOSIT_BTC:
      return <DepositBTC />
    default: {
      return null
    }
  }
}
