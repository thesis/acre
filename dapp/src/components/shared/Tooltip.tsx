import React, { useState } from "react"
import { Box, Tooltip as ChakraTooltip, TooltipProps } from "@chakra-ui/react"

export default function Tooltip(props: TooltipProps) {
  const { children, ...restProps } = props
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ChakraTooltip isOpen={isOpen} {...restProps}>
      <Box
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(true)}
      >
        {children}
      </Box>
    </ChakraTooltip>
  )
}
