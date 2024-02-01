import React, { ReactElement, useEffect } from "react"
import { useModalFlowContext } from "#/hooks"
import { ACTION_FLOW_STEPS_TYPES, ActionFlowType } from "#/types"
import { ActiveUnstakingStep } from "../Modals/Unstaking"
import { ActiveStakingStep } from "../Modals/Staking"

const FLOW: Record<ActionFlowType, (activeStep: number) => ReactElement> = {
  STAKE: (activeStep) => <ActiveStakingStep activeStep={activeStep} />,
  UNSTAKE: (activeStep) => <ActiveUnstakingStep activeStep={activeStep} />,
}

export function ActiveFlowStep() {
  const { activeStep, type, onClose } = useModalFlowContext()
  const numberOfSteps = Object.keys(ACTION_FLOW_STEPS_TYPES[type]).length

  useEffect(() => {
    if (activeStep > numberOfSteps) {
      onClose()
    }
  }, [activeStep, numberOfSteps, onClose])

  return FLOW[type](activeStep)
}
