import React from "react"
import { Box } from "@chakra-ui/react"
import ConnectWallet from "./ConnectWallet"

export default function Navbar() {
  return (
    <Box p={4} display="flex" justifyContent="end">
      <ConnectWallet />
    </Box>
  )
}
