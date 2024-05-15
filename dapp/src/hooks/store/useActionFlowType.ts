import { selectActionFlowType } from "#/store/action-flow"
import { useAppSelector } from "./useAppSelector"

export function useActionFlowType() {
  return useAppSelector(selectActionFlowType)
}
