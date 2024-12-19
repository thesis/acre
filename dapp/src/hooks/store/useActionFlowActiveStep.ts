import { selectActionFlowActiveStep } from "#/store/action-flow"
import useAppSelector from "./useAppSelector"

export default function useActionFlowActiveStep() {
  return useAppSelector(selectActionFlowActiveStep)
}
