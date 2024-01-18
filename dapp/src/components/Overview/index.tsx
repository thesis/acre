import React from "react"
import { Button, Flex, Grid, HStack, Icon, Switch } from "@chakra-ui/react"
import { useDocsDrawer } from "#/hooks"
import { TextSm } from "#/components/shared/Typography"
import { ArrowUpRight } from "#/static/icons"
import { USD } from "#/constants"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"

export default function Overview() {
  const { onOpen } = useDocsDrawer()

  return (
    <Flex direction="column" gap={2} p={6}>
      <Flex justifyContent="space-between" alignItems="center">
        <HStack>
          {/* TODO: Handle click actions */}
          <Switch size="sm" />
          <TextSm fontWeight="bold">Show values in {USD.symbol}</TextSm>
        </HStack>
        <Button
          variant="card"
          onClick={onOpen}
          leftIcon={<Icon as={ArrowUpRight} color="brand.400" boxSize={4} />}
        >
          Docs
        </Button>
      </Flex>
      <Grid
        templateAreas={`"position-details statistics"
                        "transaction-history transaction-history"`}
        gridTemplateColumns={{ base: "30% 1fr", xl: "20% 1fr" }}
        gridTemplateRows={{ base: "55% 1fr", xl: "45% 1fr" }}
        h="80vh"
        gap={4}
      >
        <PositionDetails gridArea="position-details" />
        <Statistics gridArea="statistics" />
        <TransactionHistory gridArea="transaction-history" />
      </Grid>
    </Flex>
  )
}
