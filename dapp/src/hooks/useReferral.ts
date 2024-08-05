import { env } from "#/constants"
import { useCallback, useMemo } from "react"
import useLocalStorage from "./useLocalStorage"

const PARAM_NAME = "ref"

type UseReferralReturn = {
  referral: number
  detectReferral: () => void
  resetReferral: () => void
}

export default function useReferral(): UseReferralReturn {
  const [referral, setReferral] = useLocalStorage<number>(
    "referral",
    env.REFERRAL,
  )

  const detectReferral = useCallback(() => {
    const params = new URLSearchParams(window.location.search)
    const param = params.get(PARAM_NAME)
    const detectedReferral = param ? parseInt(param, 10) : null

    if (detectedReferral) {
      setReferral(detectedReferral)
    } else {
      setReferral(env.REFERRAL)
    }
  }, [setReferral])

  const resetReferral = useCallback(() => {
    setReferral(env.REFERRAL)
  }, [setReferral])

  return useMemo(
    () => ({
      detectReferral,
      resetReferral,
      referral,
    }),
    [detectReferral, resetReferral, referral],
  )
}
