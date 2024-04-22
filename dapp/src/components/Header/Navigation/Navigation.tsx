import React from "react"
import { Box, BoxProps, HStack, List } from "@chakra-ui/react"
import NavigationItem, { NavigationItemProps } from "./NavigationItem"

type NavigationProps = BoxProps & {
  items: NavigationItemProps[]
}

function Navigation(props: NavigationProps) {
  const { items, ...restProps } = props

  return (
    <Box as="nav" {...restProps}>
      <HStack as={List} spacing={5} ml={12}>
        {items.map((item) => (
          <NavigationItem key={item.href} {...item} />
        ))}
      </HStack>
    </Box>
  )
}

export default Navigation
