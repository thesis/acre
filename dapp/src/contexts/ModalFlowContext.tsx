import { createContext } from "react"

export type ModalStep = {
  goNext: () => void
  goBack?: () => void
}

export type ModalFlowContextValue = {
  activeStep?: number
  isPaused?: boolean
  onClose: () => void
  onResume: () => void
  goNext: () => void
}

export const ModalFlowContext = createContext<ModalFlowContextValue>({
  activeStep: undefined,
  isPaused: false,
  onClose: () => {},
  onResume: () => {},
  goNext: () => {},
})
