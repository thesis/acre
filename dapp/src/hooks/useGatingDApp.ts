import { useEffect, useRef } from "react"
import { MODAL_TYPES } from "#/types"
import { featureFlags } from "#/constants"
import { useModal } from "./useModal"
import useAccessCode from "./useAccessCode"

export default function useGatingDApp() {
  const { encodedCode } = useAccessCode()
  const { openModal } = useModal()
  const isMounted = useRef(false)

  useEffect(() => {
    if (featureFlags.GATING_DAPP_ENABLED && !isMounted.current) {
      isMounted.current = true

      if (encodedCode) return

      openModal(MODAL_TYPES.GATE, {
        withCloseButton: false,
        closeOnEsc: false,
      })
    }
  }, [encodedCode, openModal])
}
