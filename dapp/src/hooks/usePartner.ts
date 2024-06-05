import { Partner } from "#/types"
import { useMemo, useCallback } from "react"
import { isOfTypePartners } from "#/utils"
import { useLocalStorage } from "./useLocalStorage"

export function usePartner() {
  const [partner, setPartner] = useLocalStorage<Partner | undefined>(
    "partner",
    undefined,
  )

  const detectPartner = useCallback(() => {
    const params = new URLSearchParams(window.location.search)
    const detectedPartner = params.get("partner")

    if (detectedPartner && isOfTypePartners(detectedPartner)) {
      setPartner(detectedPartner)
    }
  }, [setPartner])

  const resetPartner = useCallback(() => {
    setPartner(undefined)
  }, [setPartner])

  return useMemo(
    () => ({
      detectPartner,
      resetPartner,
      partner,
    }),
    [detectPartner, resetPartner, partner],
  )
}
