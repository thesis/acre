import React from "react"
import { AcreLogoIcon } from "#/assets/icons"
import { HStack, Icon, Link } from "@chakra-ui/react"
import { externalHref } from "#/constants"
import ConnectWallet from "./ConnectWallet"

export default function Header() {
  return (
    <HStack
      as="header"
      w="full"
      maxW="120rem" // 1920px
      mx="auto"
      justify="space-between"
      zIndex="header"
      pt={{ base: 4, md: 12 }}
      pb={{ base: 4, xl: 12 }}
      px={{ base: 4, md: "2.5rem", xl: 30 }}
    >
      <Link href={externalHref.WEBSITE} isExternal>
        <Icon as={AcreLogoIcon} w={20} h={12} />
      </Link>

      <ConnectWallet />
    </HStack>
  )
}
