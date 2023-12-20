import { useContext } from "react"
import { ModalFlowContext } from "../contexts"

export function useModalFlowContext() {
  const context = useContext(ModalFlowContext)

  if (!context) {
    throw new Error(
      "ModalFlowContext used outside of ModalFlowContext component",
    )
  }

  return context
}
