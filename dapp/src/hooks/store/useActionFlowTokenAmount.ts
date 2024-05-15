import { selectActionFlowTokenAmount } from "#/store/action-flow"
import { useAppSelector } from "./useAppSelector"

export function useActionFlowTokenAmount() {
  return useAppSelector(selectActionFlowTokenAmount)
}
