import React from "react"
import { Flex } from "@chakra-ui/react"
import ConnectWallet from "./ConnectWallet"

export const HEADER_HEIGHT = 24

export default function Header() {
  return (
    <Flex justifyContent="end" p={6} height={HEADER_HEIGHT}>
      <ConnectWallet />
    </Flex>
  )
}
