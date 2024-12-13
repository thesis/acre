import { selectActionFlowTokenAmount } from "#/store/action-flow"
import useAppSelector from "./useAppSelector"

export default function useActionFlowTokenAmount() {
  return useAppSelector(selectActionFlowTokenAmount)
}
