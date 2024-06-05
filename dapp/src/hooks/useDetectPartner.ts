import { useEffect } from "react"
import { usePartner } from "./usePartner"

export function useDetectPartner() {
  const { detectPartner } = usePartner()

  useEffect(() => {
    detectPartner()
  }, [detectPartner])
}
