import { selectActionFlowActiveStep } from "#/store/action-flow"
import { useAppSelector } from "./useAppSelector"

export function useActionFlowActiveStep() {
  return useAppSelector(selectActionFlowActiveStep)
}
