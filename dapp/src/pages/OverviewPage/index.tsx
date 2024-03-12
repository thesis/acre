import React from "react"
import { Flex, Grid, HStack, Switch } from "@chakra-ui/react"
import { useDocsDrawer } from "#/hooks"
import { TextSm } from "#/components/shared/Typography"
import { USD } from "#/constants"
import ButtonLink from "#/components/shared/ButtonLink"
import ActivityBar from "#/components/shared/ActivityBar"
import PositionDetails from "./PositionDetails"
import StatisticsChart from "./StatisticsChart"
import TransactionHistory from "./TransactionHistory"
import { StatisticsCard } from "./StatisticsCard"

export default function OverviewPage() {
  const { onOpen } = useDocsDrawer()

  return (
    <Flex direction="column" gap={3.5} p={6}>
      <HStack>
        {/* TODO: Handle click actions */}
        <Switch size="sm" />
        <TextSm fontWeight="bold">Show values in {USD.symbol}</TextSm>
      </HStack>
      <Flex marginBottom={3.5} justifyContent="space-between">
        <ActivityBar />
        <ButtonLink colorScheme="gold" bg="gold.200" onClick={onOpen}>
          Docs
        </ButtonLink>
      </Flex>
      <Grid
        templateAreas={`"position-details statistics-chart statistics-card"
                        "transaction-history transaction-history transaction-history"`}
        gridTemplateColumns={{ base: "30% 1fr", xl: "20% 1fr" }}
        gridTemplateRows={{ base: "55% 1fr", xl: "1fr" }}
        gap={4}
      >
        <PositionDetails gridArea="position-details" />
        <StatisticsChart gridArea="statistics-chart" />
        <StatisticsCard gridArea="statistics-card" />
        <TransactionHistory gridArea="transaction-history" />
      </Grid>
    </Flex>
  )
}
