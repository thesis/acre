import React from "react"
import { ACTION_FLOW_TYPES, ActionFlowType } from "#/types"
import StakingErrorModal from "./ActiveStakingStep/StakingErrorModal"
import UnstakeErrorModal from "./ActiveUnstakingStep/UnstakeErrorModal"

export default function ErrorModal({ type }: { type: ActionFlowType }) {
  if (type === ACTION_FLOW_TYPES.STAKE) return <StakingErrorModal />
  if (type === ACTION_FLOW_TYPES.UNSTAKE) return <UnstakeErrorModal />
  return null
}
