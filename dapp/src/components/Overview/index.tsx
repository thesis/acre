import React from "react"
import { Button, Flex, Grid, Icon, Switch } from "@chakra-ui/react"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"
import { USD } from "../../constants"
import { ArrowUpRight } from "../../static/icons"

export default function Overview() {
  return (
    <Flex direction="column" gap={2} p={6}>
      <Flex justifyContent="space-between">
        {/* TODO: Handle click actions */}
        <Switch size="sm">Show values in {USD.symbol}</Switch>
        <Button
          variant="card"
          leftIcon={<Icon as={ArrowUpRight} color="brand.400" boxSize={4} />}
        >
          Docs
        </Button>
      </Flex>
      <Grid
        templateAreas={`"position-details statistics"
                        "transaction-history transaction-history"`}
        gridTemplateColumns={{ base: "30% 1fr", xl: "20% 1fr" }}
        gridTemplateRows={{ base: "55% 1fr", xl: "40% 1fr" }}
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
