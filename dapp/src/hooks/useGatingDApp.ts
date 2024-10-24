import { useEffect, useRef } from "react"
import { MODAL_TYPES } from "#/types"
import { featureFlags } from "#/constants"
import { useQuery } from "@tanstack/react-query"
import { acreApi } from "#/utils"
import { useModal } from "./useModal"
import useAccessCode from "./useAccessCode"

export default function useGatingDApp() {
  const { encodedCode } = useAccessCode()
  const { openModal, closeModal, modalType } = useModal()
  const isMounted = useRef(false)
  const { data: isValid, isLoading } = useQuery({
    queryKey: ["verify-access-code"],
    enabled: !!encodedCode,
    queryFn: async () => acreApi.verifyAccessCode(encodedCode!),
  })

  useEffect(() => {
    if (!featureFlags.GATING_DAPP_ENABLED) return

    if (!encodedCode) return

    if (modalType === MODAL_TYPES.LOADING && !isLoading) {
      closeModal()
      if (!isValid) openModal(MODAL_TYPES.GATE)
    }
  }, [closeModal, isValid, encodedCode, isLoading, modalType, openModal])

  useEffect(() => {
    if (!featureFlags.GATING_DAPP_ENABLED) return

    if (isMounted.current) return

    isMounted.current = true
    openModal(encodedCode ? MODAL_TYPES.LOADING : MODAL_TYPES.GATE)
  }, [encodedCode, openModal])
}
