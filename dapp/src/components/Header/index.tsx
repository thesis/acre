import React from "react"
import { AcreLogo } from "#/assets/icons"
import { Flex, HStack, Icon } from "@chakra-ui/react"
import { routerPath } from "#/router/path"
import ConnectWallet from "./ConnectWallet"
import Navigation, { NavigationItemType } from "./Navigation"

// TODO: To be adjusted after project pivot/cleanup
const NAVIGATION_ITEMS: NavigationItemType[] = [
  { label: "Season 1", href: routerPath.home },
  { label: "Dashboard", href: routerPath.overview },
]

export default function Header() {
  return (
    <HStack as="header" px={10} py={7}>
      <Icon as={AcreLogo} w={20} h={12} />
      <Navigation items={NAVIGATION_ITEMS} />
      <Flex ml="auto">
        <ConnectWallet />
      </Flex>
    </HStack>
  )
}
