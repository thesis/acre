import { createContext } from "react"

export type ModalStep = {
  goNext: () => void
}

export type ModalFlowContextValue = {
  activeStep?: number
  onClose: () => void
  goNext: () => void
}

export const ModalFlowContext = createContext<ModalFlowContextValue>({
  activeStep: undefined,
  goNext: () => {},
  onClose: () => {},
})
