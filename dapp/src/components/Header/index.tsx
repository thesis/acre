import React from "react"
import { Box, Flex, Icon } from "@chakra-ui/react"
import ConnectWallet from "./ConnectWallet"
import { AcreLogo } from "../../static/icons"

export default function Header() {
  return (
    <Box as="header">
      <Icon as={AcreLogo} boxSize={20} position="absolute" left={6} />
      <Flex justifyContent="end" p={6}>
        <ConnectWallet />
      </Flex>
    </Box>
  )
}
