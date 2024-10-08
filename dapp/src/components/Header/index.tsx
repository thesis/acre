import React from "react"
import { AcreLogo } from "#/assets/icons"
import { Flex, HStack, Icon, Link } from "@chakra-ui/react"
import { EXTERNAL_HREF } from "#/constants"
import { useMobileMode } from "#/hooks"
import ConnectWallet from "./ConnectWallet"
import { Navigation } from "./Navigation"

export default function Header() {
  const isMobileMode = useMobileMode()

  return (
    <HStack
      as="header"
      w="full"
      mx="auto"
      justify="center"
      py={7}
      px="page_content_padding_x"
      maxW="page_content_max_width"
    >
      <Link href={EXTERNAL_HREF.WEBSITE} isExternal>
        <Icon as={AcreLogo} w={20} h={12} />
      </Link>

      {!isMobileMode && (
        <>
          <Navigation />
          <Flex ml="auto">
            <ConnectWallet />
          </Flex>
        </>
      )}
    </HStack>
  )
}
