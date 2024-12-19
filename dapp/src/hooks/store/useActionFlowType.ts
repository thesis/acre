import { selectActionFlowType } from "#/store/action-flow"
import useAppSelector from "./useAppSelector"

export default function useActionFlowType() {
  return useAppSelector(selectActionFlowType)
}
