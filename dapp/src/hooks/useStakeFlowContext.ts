import { useContext } from "react"
import { StakeFlowContext } from "#/contexts"

export default function useStakeFlowContext() {
  const context = useContext(StakeFlowContext)

  if (!context) {
    throw new Error(
      "StakeFlowContext used outside of StakeFlowProvider component",
    )
  }

  return context
}
