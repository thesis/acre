import { Partner } from "#/types"
import { useMemo, useCallback } from "react"
import { isOfTypePartners } from "#/utils"
import { EXTERNAL_HREF } from "#/constants"
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
    } else {
      // TODO: Temporary solution - Update when designs for dApp are ready
      window.open(EXTERNAL_HREF.ACRE, "_self")
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
