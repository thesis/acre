import { selectActionFlowStatus } from "#/store/action-flow"
import { useAppSelector } from "./useAppSelector"

export function useActionFlowStatus() {
  return useAppSelector(selectActionFlowStatus)
}
