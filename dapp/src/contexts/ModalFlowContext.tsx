import { ActionFlowType, ProcessStatus } from "#/types"
import { createContext } from "react"

export type ModalFlowContextValue = {
  type: ActionFlowType
  activeStep: number
  status: ProcessStatus
  setType: React.Dispatch<React.SetStateAction<ActionFlowType>>
  onClose: () => void
  onResume: () => void
  goNext: () => void
  setStatus: React.Dispatch<React.SetStateAction<ProcessStatus>>
}

export const ModalFlowContext = createContext<
  ModalFlowContextValue | undefined
>(undefined)
