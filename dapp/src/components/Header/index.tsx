import React from "react"
import { Button, Flex, Icon, Switch } from "@chakra-ui/react"
import ConnectWallet from "./ConnectWallet"
import { ChevronRight } from "../../static/icons"
import { USD } from "../../constants"

export default function Header() {
  return (
    <Flex gap={4} direction="column">
      <Flex justifyContent="end">
        <ConnectWallet />
      </Flex>
      <Flex justifyContent="space-between">
        {/* TODO: Handle click actions */}
        <Switch size="sm">Show values in {USD.symbol}</Switch>
        <Button variant="link" rightIcon={<Icon as={ChevronRight} />}>
          Read documentation
        </Button>
      </Flex>
    </Flex>
  )
}
