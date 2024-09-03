import React from "react"
import { AcreLogo } from "#/assets/icons"
import { routerPath } from "#/router/path"
import { Flex, HStack, Icon, Link } from "@chakra-ui/react"
import { NavigationItemType } from "#/types"
import { EXTERNAL_HREF } from "#/constants"
import { useMobileMode } from "#/hooks"
import ConnectWallet from "./ConnectWallet"
import { Navigation } from "./Navigation"

const NAVIGATION_ITEMS: NavigationItemType[] = [
  { label: "Dashboard", href: routerPath.home },
]

export default function Header() {
  const isMobileMode = useMobileMode()

  return (
    <HStack as="header" px={10} py={7} justify="center">
      <Link href={EXTERNAL_HREF.WEBSITE} isExternal>
        <Icon as={AcreLogo} w={20} h={12} />
      </Link>

      {!isMobileMode && (
        <>
          <Navigation items={NAVIGATION_ITEMS} />
          <Flex ml="auto">
            <ConnectWallet />
          </Flex>
        </>
      )}
    </HStack>
  )
}
