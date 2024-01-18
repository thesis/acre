import { createContext } from "react"

export type ModalStep = {
  goNext: () => void
  goBack?: () => void
}

export type ModalFlowContextValue = {
  activeStep?: number
  isResumeStep?: boolean
  onClose: () => void
  onResume: () => void
  goNext: () => void
  goBack?: () => void
}

export const ModalFlowContext = createContext<ModalFlowContextValue>({
  activeStep: undefined,
  isResumeStep: false,
  onClose: () => {},
  onResume: () => {},
  goNext: () => {},
  goBack: () => {},
})
