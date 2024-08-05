import { env } from "#/constants"
import { useCallback, useMemo } from "react"
import { SEARCH_PARAMS_NAMES } from "#/router/path"
import useLocalStorage from "./useLocalStorage"

const MAX_UINT16 = 65535

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
    const param = params.get(SEARCH_PARAMS_NAMES.referral)
    const detectedReferral = param ? parseInt(param, 10) : null

    if (detectedReferral && detectedReferral <= MAX_UINT16) {
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
