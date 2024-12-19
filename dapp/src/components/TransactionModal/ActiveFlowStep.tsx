import React, { ReactElement, useEffect } from "react"
import { useActionFlowActiveStep, useActionFlowType, useModal } from "#/hooks"
import {
  ACTION_FLOW_STEPS_TYPES,
  ActionFlowType,
  ACTION_FLOW_TYPES,
} from "#/types"
import ActiveUnstakingStep from "./ActiveUnstakingStep"
import ActiveStakingStep from "./ActiveStakingStep"

const FLOW: Record<ActionFlowType, (activeStep: number) => ReactElement> = {
  [ACTION_FLOW_TYPES.STAKE]: (activeStep) => (
    <ActiveStakingStep activeStep={activeStep} />
  ),
  [ACTION_FLOW_TYPES.UNSTAKE]: (activeStep) => (
    <ActiveUnstakingStep activeStep={activeStep} />
  ),
}

export default function ActiveFlowStep() {
  const { closeModal } = useModal()
  const activeStep = useActionFlowActiveStep()
  const type = useActionFlowType()

  const numberOfSteps = Object.keys(ACTION_FLOW_STEPS_TYPES[type]).length

  useEffect(() => {
    if (activeStep > numberOfSteps) {
      closeModal()
    }
  }, [activeStep, closeModal, numberOfSteps])

  return FLOW[type](activeStep)
}
