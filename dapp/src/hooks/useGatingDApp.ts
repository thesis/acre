import { useEffect, useRef } from "react"
import { MODAL_TYPES } from "#/types"
import { featureFlags } from "#/constants"
import { useModal } from "./useModal"
import useIsEmbed from "./useIsEmbed"

export default function useGatingDApp() {
  const { isEmbed } = useIsEmbed()
  const { openModal } = useModal()
  const isMounted = useRef(false)

  useEffect(() => {
    if (featureFlags.GATING_DAPP_ENABLED && !isMounted.current && !isEmbed) {
      isMounted.current = true
      openModal(MODAL_TYPES.GATE, {
        withCloseButton: false,
        closeOnEsc: false,
      })
    }
  }, [isEmbed, openModal])
}
