import React from "react"
import { Flex, HStack, Icon } from "@chakra-ui/react"
import ConnectWallet from "./ConnectWallet"
import { AcreLogo } from "../../static/icons"

export const HEADER_HEIGHT = 24

export default function Header() {
  return (
    <HStack as="header" p={6} height={HEADER_HEIGHT}>
      <Icon as={AcreLogo} w={20} h={12} />
      <Flex ml="auto">
        <ConnectWallet />
      </Flex>
    </HStack>
  )
}
