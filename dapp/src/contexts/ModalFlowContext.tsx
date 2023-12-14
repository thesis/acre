import { createContext } from "react"

export type ModalStep = {
  goNext: () => void
}

export type ModalFlowContextValue = {
  activeStep?: string
  steps: string[]
  onClose: () => void
  goNext: () => void
}

export const ModalFlowContext = createContext<ModalFlowContextValue>({
  activeStep: undefined,
  steps: [],
  goNext: () => {},
  onClose: () => {},
})
