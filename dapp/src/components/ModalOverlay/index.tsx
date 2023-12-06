import React, { useEffect, useState } from "react"
import { Box, useColorModeValue } from "@chakra-ui/react"
import { useStakingFlowContext } from "../../hooks"

const DELAY = 300

export default function ModalOverlay({ marginTop }: { marginTop?: number }) {
  const { modalType } = useStakingFlowContext()
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
      // TODO: Set the correct background color
      bg={useColorModeValue("grey.100", "grey.300")}
      opacity={modalType ? 1 : 0}
      zIndex="overlay"
      // Hide the element when it is no longer needed.
      display={showOverlay ? "block" : "none"}
      // zIndex={showOverlay ? "overlay" : "-1"}
      transition={`opacity ${DELAY}ms`}
      mt={marginTop}
    />
  )
}
