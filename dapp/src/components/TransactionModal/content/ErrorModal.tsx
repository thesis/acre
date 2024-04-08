import React from "react"
import { ActionFlowType } from "#/types"
import StakingErrorModal from "../ActiveStakingStep/StakingErrorModal"

export function ErrorModal({ type }: { type: ActionFlowType }) {
  if (type === "stake") return <StakingErrorModal />
  // TODO: Handle the case of unstake action
  return null
}
