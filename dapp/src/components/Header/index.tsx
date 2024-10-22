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
      justify="space-between"
      py={7}
      px="page_content_padding_x"
    >
      <Link href={EXTERNAL_HREF.WEBSITE} isExternal>
        <Icon as={AcreLogo} w={20} h={12} />
      </Link>

      {!isMobileMode && <ConnectWallet />}
    </HStack>
  )
}
