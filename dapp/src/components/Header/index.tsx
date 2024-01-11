import React from "react"
import { Flex, HStack, Icon } from "@chakra-ui/react"
import { AcreLogo } from "~/static/icons"
import ConnectWallet from "./ConnectWallet"

export default function Header() {
  return (
    <HStack as="header" p={6}>
      <Icon as={AcreLogo} w={20} h={12} />
      <Flex ml="auto">
        <ConnectWallet />
      </Flex>
    </HStack>
  )
}
