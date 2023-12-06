import React from "react"
import { Flex } from "@chakra-ui/react"
import ConnectWallet from "./ConnectWallet"

export default function Header() {
  return (
    <Flex justifyContent="end" p={6}>
      <ConnectWallet />
    </Flex>
  )
}
