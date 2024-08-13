import React from "react"
import { HStack, StackProps } from "@chakra-ui/react"

type PaginationFooterProps = StackProps & { containerPadding: number }

function PaginationFooter(props: PaginationFooterProps) {
  const { children, containerPadding, ...restProps } = props

  return (
    <HStack
      mx={-containerPadding}
      mt={-containerPadding + 1}
      mb={-containerPadding}
      p={containerPadding}
      pt={containerPadding + 1}
      bgGradient="linear(to-b, transparent, gold.200 20%)"
      zIndex={2}
      {...restProps}
    >
      {children}
    </HStack>
  )
}

export default PaginationFooter
