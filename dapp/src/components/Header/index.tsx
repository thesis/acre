import React from "react"
import { AcreLogo } from "#/assets/icons"
import { HStack, Icon, Link } from "@chakra-ui/react"
import { EXTERNAL_HREF } from "#/constants"
import { useMobileMode } from "#/hooks"
import ConnectWallet from "./ConnectWallet"

export default function Header() {
  const isMobileMode = useMobileMode()

  return (
    <HStack
      as="header"
      w="full"
      maxW="120rem" // 1920px
      mx="auto"
      justify="space-between"
      pt={12}
      pb={{ base: 4, xl: 16 }}
      px={{ base: 10, xl: 30 }}
    >
      <Link href={EXTERNAL_HREF.WEBSITE} isExternal>
        <Icon as={AcreLogo} w={20} h={12} />
      </Link>

      {!isMobileMode && <ConnectWallet />}
    </HStack>
  )
}
