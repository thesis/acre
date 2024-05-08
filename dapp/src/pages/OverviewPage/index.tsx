import React from "react"
import { Card, Flex, Grid, HStack, Switch } from "@chakra-ui/react"
import { TextSm } from "#/components/shared/Typography"
import { USD } from "#/constants"
import { chakraUnitToPx } from "#/theme/utils"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"
import { DocsCard } from "./DocsCard"
import { ActivityCarousel } from "./ActivityCarousel"

const MOCK_TRANSACTION_HISTORY_DATA = [
  {
    date: "2 mins ago",
    type: "Deposit",
    amount: 499000000,
    address: "1Lbcfr7sA.....8LK4ZnX71",
    url: "#1",
  },
  {
    date: "3 hours ago",
    type: "Withdraw",
    amount: 499000000,
    address: "1Lbcfr7sA.....8LK4ZnX71",
    url: "#2",
  },
  Array(16)
    .fill({
      date: "23/11/2023, 12:01",
      type: "Deposit",
      amount: 499000000,
      address: "1Lbcfr7sA.....8LK4ZnX71",
    })
    .map((x, i) => ({ ...x, url: `#${i + 3}` })),
].flat()

export default function OverviewPage() {
  return (
    <Flex direction="column" p={6} gap={8}>
      <Card overflow="hidden" p={5} w="full" maxW={748} mx="auto">
        <TransactionHistory data={MOCK_TRANSACTION_HISTORY_DATA} />
      </Card>

      <Card overflow="hidden" p={5} w="full" maxW={748} mx="auto">
        <TransactionHistory />
      </Card>
    </Flex>
  )

  return (
    <Flex direction="column" p={6}>
      <HStack pb={3.5}>
        {/* TODO: Handle click actions */}
        <Switch size="sm" />
        <TextSm fontWeight="bold">Show values in {USD.symbol}</TextSm>
      </HStack>

      <Grid
        templateAreas={'"activity-carousel docs-card"'}
        gridTemplateColumns={`calc(100% - ${chakraUnitToPx(64)}px) auto`}
      >
        <ActivityCarousel gridArea="activity-carousel" />
        <DocsCard gridArea="docs-card" />
      </Grid>
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
        {/* <TransactionHistory gridArea="transaction-history" /> */}
      </Grid>
    </Flex>
  )
}
