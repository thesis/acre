import { env } from "#/constants"
import { useCallback, useMemo } from "react"
import useLocalStorage, { writeStorage } from "./useLocalStorage"

type UseReferralReturn = {
  referral: number | null
  resetReferral: () => void
}

const LOCAL_STORAGE_KEY = "acre.referral"

export const writeReferral = (value: string) => {
  writeStorage(LOCAL_STORAGE_KEY, value)
}

export default function useReferral(): UseReferralReturn {
  const [referral, setReferral] = useLocalStorage<number>(
    LOCAL_STORAGE_KEY,
    env.REFERRAL,
  )

  const resetReferral = useCallback(() => {
    setReferral(env.REFERRAL)
  }, [setReferral])

  return useMemo(
    () => ({
      resetReferral,
      referral,
    }),
    [resetReferral, referral],
  )
}
