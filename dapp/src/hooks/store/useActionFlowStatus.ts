import { selectActionFlowStatus } from "#/store/action-flow"
import useAppSelector from "./useAppSelector"

export default function useActionFlowStatus() {
  return useAppSelector(selectActionFlowStatus)
}
