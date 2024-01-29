import React, { ReactElement } from "react"
import { useModalFlowContext } from "#/hooks"
import { ActionFlowType } from "#/types"
import { ActiveUnstakingStep } from "../Modals/Unstaking"
import { ActiveStakingStep } from "../Modals/Staking"

const FLOW: Record<ActionFlowType, (activeStep: number) => ReactElement> = {
  stake: (activeStep) => <ActiveStakingStep activeStep={activeStep} />,
  unstake: (activeStep) => <ActiveUnstakingStep activeStep={activeStep} />,
}

export function ActiveFlowStep() {
  const { activeStep, type } = useModalFlowContext()

  return FLOW[type](activeStep)
}
