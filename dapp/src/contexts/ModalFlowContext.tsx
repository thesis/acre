import { ActionFlowType } from "#/types"
import { createContext } from "react"

export type ModalFlowContextValue = {
  type: ActionFlowType
  activeStep: number
  isPaused: boolean
  setType: React.Dispatch<React.SetStateAction<ActionFlowType>>
  onClose: () => void
  onResume: () => void
  goNext: () => void
  startTransactionProcess: () => void
  endTransactionProcess: () => void
}

export const ModalFlowContext = createContext<
  ModalFlowContextValue | undefined
>(undefined)
