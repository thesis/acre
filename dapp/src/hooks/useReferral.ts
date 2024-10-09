import { env } from "#/constants"
import { useCallback, useMemo } from "react"
import { referralProgram } from "#/utils"
import useLocalStorage from "./useLocalStorage"
import useIsEmbed from "./useIsEmbed"

type UseReferralReturn = {
  referral: number | null
  detectReferral: () => void
  resetReferral: () => void
}

export default function useReferral(): UseReferralReturn {
  const [referral, setReferral] = useLocalStorage<number>(
    "acre.referral",
    env.REFERRAL,
  )
  const { isEmbed, embeddedApp } = useIsEmbed()

  const detectReferral = useCallback(() => {
    if (isEmbed && embeddedApp) {
      setReferral(referralProgram.getReferralByEmbeddedApp(embeddedApp))
      return
    }

    setReferral(env.REFERRAL)
  }, [isEmbed, embeddedApp, setReferral])

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
