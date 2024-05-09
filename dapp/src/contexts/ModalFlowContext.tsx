import { createContext } from "react"

export type ModalFlowContextValue = {
  onClose: () => void
}

export const ModalFlowContext = createContext<
  ModalFlowContextValue | undefined
>(undefined)
