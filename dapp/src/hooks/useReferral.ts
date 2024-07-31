import { referrals } from "#/constants"
import { useCallback, useMemo } from "react"
import useLocalStorage from "./useLocalStorage"

const PARAM_NAME = "ref"

function isExistingReferral(detectedReferral: number) {
  const referral = Object.values(referrals)
  return referral.includes(detectedReferral)
}

type UseReferralReturn = {
  referral: number
  detectReferral: () => void
  resetReferral: () => void
}

export default function useReferral(): UseReferralReturn {
  const [referral, setReferral] = useLocalStorage<number>(
    "referral",
    referrals.DEFAULT,
  )

  const detectReferral = useCallback(() => {
    const params = new URLSearchParams(window.location.search)
    const param = params.get(PARAM_NAME)
    const detectedReferral = param ? parseInt(param, 10) : null

    if (detectedReferral && isExistingReferral(detectedReferral)) {
      setReferral(detectedReferral)
    } else {
      setReferral(referrals.DEFAULT)
    }
  }, [setReferral])

  const resetReferral = useCallback(() => {
    setReferral(referrals.DEFAULT)
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
