import React, { useState } from "react"
import {
  Box,
  BoxProps,
  Tooltip as ChakraTooltip,
  TooltipProps as ChakraTooltipProps,
} from "@chakra-ui/react"

type TooltipProps = ChakraTooltipProps & {
  wrapperProps?: BoxProps
}

export default function Tooltip(props: TooltipProps) {
  const { children, wrapperProps, ...restProps } = props
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ChakraTooltip isOpen={isOpen} {...restProps}>
      <Box
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(true)}
        {...wrapperProps}
      >
        {children}
      </Box>
    </ChakraTooltip>
  )
}
