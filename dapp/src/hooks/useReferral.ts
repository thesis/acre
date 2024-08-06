import { env } from "#/constants"
import { useCallback, useMemo } from "react"
import { SEARCH_PARAMS_NAMES } from "#/router/path"
import { MODAL_TYPES } from "#/types"
import { referralProgram } from "#/utils"
import useLocalStorage from "./useLocalStorage"
import { useModal } from "./useModal"

type UseReferralReturn = {
  referral?: number
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
    const params = new URLSearchParams(window.location.search)
    const param = params.get(SEARCH_PARAMS_NAMES.referral)

    if (param === null) {
      setReferral(env.REFERRAL)
      return
    }

    const convertedReferral = Number(param)

    if (referralProgram.isValidReferral(convertedReferral)) {
      setReferral(convertedReferral)
    } else {
      setReferral(undefined)
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
