import { useContext } from "react"
import { StakeFlowContext } from "#/contexts"

export function useStakeFlowContext() {
  const context = useContext(StakeFlowContext)

  if (!context) {
    throw new Error(
      "StakeFlowContext used outside of StakeFlowContext component",
    )
  }

  return context
}
