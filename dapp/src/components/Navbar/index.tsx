import React from "react"
import { Box, Button, HStack, Icon, Switch } from "@chakra-ui/react"
import ConnectWallet from "./ConnectWallet"
import { ChevronRight } from "../../static/icons"
import { FIAT_CURRENCY_USD } from "../../constants"

export default function Navbar() {
  return (
    <Box mb={4}>
      <HStack justifyContent="end">
        <ConnectWallet />
      </HStack>
      <HStack mt={8} justifyContent="space-between">
        {/* TODO: Handle click actions */}
        <Switch size="sm">Show values in {FIAT_CURRENCY_USD}</Switch>
        <Button variant="link" rightIcon={<Icon as={ChevronRight} />}>
          Read documentation
        </Button>
      </HStack>
    </Box>
  )
}
