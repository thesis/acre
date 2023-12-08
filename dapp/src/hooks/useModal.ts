import { useContext } from "react"
import { ModalContext } from "../contexts"

export function useModal() {
  const context = useContext(ModalContext)

  if (!context) {
    throw new Error("ModalContext used outside of ModalContext component")
  }

  return context
}
