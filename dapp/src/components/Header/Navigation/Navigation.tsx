import React from "react"
import { Box, BoxProps, HStack, List } from "@chakra-ui/react"
import { EXTERNAL_HREF } from "#/constants"
import { routerPath } from "#/router/path"
import { router } from "#/utils"
import NavigationItem, { NavigationItemProps } from "./NavigationItem"

const NAVIGATION_ITEMS: NavigationItemProps[] = [
  { children: "Home", to: EXTERNAL_HREF.WEBSITE, isExternal: true },
  { children: "Stake", to: routerPath.home },
  { children: "Docs", to: EXTERNAL_HREF.DOCS, isExternal: true },
  { children: "FAQ", to: EXTERNAL_HREF.FAQ, isExternal: true },
  { children: "Blog", to: EXTERNAL_HREF.BLOG, isExternal: true },
  { children: "Discord", to: EXTERNAL_HREF.DISCORD, isExternal: true },
  { children: "X", to: EXTERNAL_HREF.X, isExternal: true },
]

function Navigation(props: BoxProps) {
  return (
    <Box as="nav" {...props}>
      <HStack as={List} spacing={5} ml={12}>
        {NAVIGATION_ITEMS.map((item) => (
          <NavigationItem key={router.getURLPath(item.to)} {...item} />
        ))}
      </HStack>
    </Box>
  )
}

export default Navigation
