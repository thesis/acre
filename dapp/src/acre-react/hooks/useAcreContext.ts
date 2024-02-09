import { useContext } from "react"
import { AcreSdkContext } from "../contexts"

export function useAcreContext() {
  const context = useContext(AcreSdkContext)

  if (!context) {
    throw new Error("AcreSdkContext used outside of AcreSdkContext component")
  }

  return context
}
