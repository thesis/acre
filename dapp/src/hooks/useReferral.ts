import { env } from "#/constants"
import { useCallback, useMemo } from "react"
import { MODAL_TYPES } from "#/types"
import { referralProgram } from "#/utils"
import useLocalStorage from "./useLocalStorage"
import { useModal } from "./useModal"

type UseReferralReturn = {
  referral: number | null
  detectReferral: () => void
  resetReferral: () => void
}

export default function useReferral(): UseReferralReturn {
  const [referral, setReferral] = useLocalStorage<number>(
    "referral",
    env.REFERRAL,
  )
  const { openModal } = useModal()

  const detectReferral = useCallback(() => {
    const param = referralProgram.getReferralFromURL()

    if (param === null) {
      setReferral(env.REFERRAL)
      return
    }

    const convertedReferral = Number(param)

    if (referralProgram.isValidReferral(convertedReferral)) {
      setReferral(convertedReferral)
    } else {
      console.error("Incorrect referral")
      setReferral(null)
      openModal(MODAL_TYPES.UNEXPECTED_ERROR, {
        withCloseButton: false,
        closeOnEsc: false,
      })
    }
  }, [openModal, setReferral])

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
