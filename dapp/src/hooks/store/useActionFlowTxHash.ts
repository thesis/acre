import { selectActionFlowTxHash } from "#/store/action-flow"
import useAppSelector from "./useAppSelector"

export default function useActionFlowTxHash() {
  return useAppSelector(selectActionFlowTxHash)
}
