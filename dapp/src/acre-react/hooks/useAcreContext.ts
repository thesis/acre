import { useContext } from "react"
import { AcreSdkContext } from "../contexts"

export default function useAcreContext() {
  const context = useContext(AcreSdkContext)

  if (!context) {
    throw new Error("AcreSdkContext used outside of AcreSdkProvider component")
  }

  return context
}
