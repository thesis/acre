import { env } from "#/constants"
import { referralProgram } from "#/utils"

import { useCallback, useMemo } from "react"
import { MODAL_TYPES } from "#/types"
import useIsEmbed from "./useIsEmbed"
import useLocalStorage from "./useLocalStorage"
import { useModal } from "./useModal"

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
  const { openModal } = useModal()
  const { isEmbed, embeddedApp } = useIsEmbed()

  const detectReferral = useCallback(() => {
    const param = referralProgram.getReferralFromURL()

    if (isEmbed && embeddedApp) {
      setReferral(referralProgram.getReferralByEmbeddedApp(embeddedApp))
      return
    }

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
  }, [isEmbed, embeddedApp, openModal, setReferral])

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
