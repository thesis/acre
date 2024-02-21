import React, { ReactElement, useEffect } from "react"
import { useModalFlowContext, useStakeFlowContext } from "#/hooks"
import {
  ACTION_FLOW_STEPS_TYPES,
  ActionFlowType,
  ACTION_FLOW_TYPES,
} from "#/types"
import { captureMessage } from "#/sdk/sentry"
import { ActiveUnstakingStep } from "./ActiveUnstakingStep"
import { ActiveStakingStep } from "./ActiveStakingStep"

const FLOW: Record<ActionFlowType, (activeStep: number) => ReactElement> = {
  [ACTION_FLOW_TYPES.STAKE]: (activeStep) => (
    <ActiveStakingStep activeStep={activeStep} />
  ),
  [ACTION_FLOW_TYPES.UNSTAKE]: (activeStep) => (
    <ActiveUnstakingStep activeStep={activeStep} />
  ),
}

export function ActiveFlowStep() {
  const { activeStep, type, onClose } = useModalFlowContext()
  const { depositReceipt, btcAddress } = useStakeFlowContext()
  const numberOfSteps = Object.keys(ACTION_FLOW_STEPS_TYPES[type]).length

  useEffect(() => {
    if (activeStep > numberOfSteps) {
      onClose()
    }
  }, [activeStep, numberOfSteps, onClose])

  useEffect(() => {
    if (depositReceipt) {
      const {
        depositor,
        blindingFactor,
        walletPublicKeyHash,
        refundPublicKeyHash,
        refundLocktime,
      } = depositReceipt
      captureMessage(`Generated deposit [${btcAddress}]`, {
        depositor: depositor.identifierHex,
        blindingFactor: blindingFactor.toString(),
        walletPublicKeyHash: walletPublicKeyHash.toString(),
        refundPublicKeyHash: refundPublicKeyHash.toString(),
        refundLocktime: refundLocktime.toString(),
      })
    }
  }, [btcAddress, depositReceipt])

  return FLOW[type](activeStep)
}
