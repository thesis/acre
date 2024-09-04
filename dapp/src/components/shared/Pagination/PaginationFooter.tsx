import React from "react"
import { HStack, StackProps } from "@chakra-ui/react"

const TOP_SPACE = 6

type PaginationFooterProps = StackProps & { containerPadding: number }

function PaginationFooter(props: PaginationFooterProps) {
  const { children, containerPadding, ...restProps } = props

  return (
    <HStack
      mx={-containerPadding}
      mb={-containerPadding}
      px={containerPadding}
      pb={containerPadding}
      mt={-TOP_SPACE}
      pt={TOP_SPACE}
      bgGradient="linear(to-b, transparent, gold.200 20%)"
      zIndex={2}
      {...restProps}
    >
      {children}
    </HStack>
  )
}

export default PaginationFooter
