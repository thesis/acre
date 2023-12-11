import React, { useEffect, useState } from "react"
import { Box } from "@chakra-ui/react"
import { useModal } from "../../hooks"
import { HEADER_HEIGHT } from "../Header"

const DELAY = 300

export default function ModalOverlay() {
  const { modalType } = useModal()
  const [showOverlay, setShowOverlay] = useState(!modalType)

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        setShowOverlay(!!modalType)
      },
      // When the modal opens, we should show the sidebar without delay.
      // However, when the modal disappears, the overlay should disappear with some delay.
      modalType ? 0 : DELAY,
    )
    return () => clearTimeout(timeout)
  }, [modalType])

  return (
    <Box
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      position="fixed"
      // TODO: Use the correct variables
      bg="#F3E5C1"
      opacity={modalType ? 1 : 0}
      zIndex="overlay"
      // Hide the element when it is no longer needed.
      display={showOverlay ? "block" : "none"}
      transition={`opacity ${DELAY}ms`}
      mt={HEADER_HEIGHT}
    />
  )
}
