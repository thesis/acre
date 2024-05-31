import { selectActionFlowTxHash } from "#/store/action-flow"
import { useAppSelector } from "./useAppSelector"

export function useActionFlowTxHash() {
  return useAppSelector(selectActionFlowTxHash)
}
