import React from "react"
import { Flex, Grid, HStack, Switch } from "@chakra-ui/react"
import { useDocsDrawer } from "#/hooks"
import { TextSm } from "#/components/shared/Typography"
import { USD } from "#/constants"
import ButtonLink from "#/components/shared/ButtonLink"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"
import ActivityBar from "../../components/shared/Activity/ActivityBar"

export default function OverviewPage() {
  const { onOpen } = useDocsDrawer()

  return (
    <Flex direction="column" gap={2} p={6}>
      <HStack>
        {/* TODO: Handle click actions */}
        <Switch size="sm" />
        <TextSm fontWeight="bold">Show values in {USD.symbol}</TextSm>
      </HStack>
      <Flex marginBottom={2} justifyContent="space-between">
        <ActivityBar />
        <ButtonLink colorScheme="gold" bg="gold.200" onClick={onOpen}>
          Docs
        </ButtonLink>
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
