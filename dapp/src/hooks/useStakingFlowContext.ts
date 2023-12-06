import { useContext } from "react"
import { StakingFlowContext } from "../contexts"

export function useStakingFlowContext() {
  const context = useContext(StakingFlowContext)

  if (!context) {
    throw new Error(
      "StakingFlowContext used outside of StakingFlowContext component",
    )
  }

  return context
}
