import React from "react"
import { AcreLogo } from "#/assets/icons"
import { routerPath } from "#/router/path"
import { Flex, HStack, Icon, Link } from "@chakra-ui/react"
import { NavigationItemType } from "#/types"
import { EXTERNAL_HREF } from "#/constants"
import ConnectWallet from "./ConnectWallet"
import { Navigation } from "./Navigation"

// TODO: To be adjusted after project pivot/cleanup
const NAVIGATION_ITEMS: NavigationItemType[] = [
  { label: "Season 1", href: routerPath.home },
  { label: "Dashboard", href: routerPath.dashboard },
]

export default function Header() {
  return (
    <HStack as="header" px={10} py={7}>
      <Link href={EXTERNAL_HREF.WEBSITE} isExternal>
        <Icon as={AcreLogo} w={20} h={12} />
      </Link>
      <Navigation items={NAVIGATION_ITEMS} />
      <Flex ml="auto">
        <ConnectWallet />
      </Flex>
    </HStack>
  )
}
