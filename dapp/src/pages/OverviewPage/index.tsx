import React from "react"
import { Flex, Grid, HStack, SimpleGrid, Switch } from "@chakra-ui/react"
import { TextSm } from "#/components/shared/Typography"
import { USD } from "#/constants"
import { ActivityCarousel } from "#/components/shared/Activities/"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"
import { DocsCard } from "./DocsCard"

export default function OverviewPage() {
  return (
    <Flex direction="column" p={6}>
      <HStack pb={3.5}>
        {/* TODO: Handle click actions */}
        <Switch size="sm" />
        <TextSm fontWeight="bold">Show values in {USD.symbol}</TextSm>
      </HStack>

      <SimpleGrid
        templateAreas={'"activity-carousel activity-carousel button-docs"'}
        gridTemplateColumns={{ base: "30% 1fr", xl: "20% 1fr" }}
      >
        <ActivityCarousel gridArea="activity-carousel" />
        <DocsCard />
      </SimpleGrid>
      <Grid
        templateAreas={`"position-details statistics"
                        "transaction-history transaction-history"`}
        gridTemplateColumns={{ base: "30% 1fr", xl: "20% 1fr" }}
        gridTemplateRows={{ base: "55% 1fr", xl: "45% 1fr" }}
        h="80vh"
        gap={6}
      >
        <PositionDetails gridArea="position-details" />
        <Statistics gridArea="statistics" />
        <TransactionHistory gridArea="transaction-history" />
      </Grid>
    </Flex>
  )
}
