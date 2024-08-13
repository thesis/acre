import { useEffect } from "react"
import useReferral from "./useReferral"

export default function useDetectReferral() {
  const { detectReferral } = useReferral()

  useEffect(() => {
    detectReferral()
  }, [detectReferral])
}
