import React from "react"
import { Card, CardBody, Flex, Grid, HStack, Switch } from "@chakra-ui/react"
import { TextSm } from "#/components/shared/Typography"
import { USD } from "#/constants"
import { chakraUnitToPx } from "#/theme/utils"
import { Pagination } from "#/components/shared/Pagination"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"
import { DocsCard } from "./DocsCard"
import { ActivityCarousel } from "./ActivityCarousel"

const MOCK_DATA = [
  { emoji: "🍎", name: "Red Apple" },
  { emoji: "🍏", name: "Green Apple" },
  { emoji: "🍐", name: "Pear" },
  { emoji: "🍊", name: "Tangerine" },
  { emoji: "🍋", name: "Lemon" },
  { emoji: "🍌", name: "Banana" },
  { emoji: "🍉", name: "Watermelon" },
  { emoji: "🍇", name: "Grapes" },
  { emoji: "🍓", name: "Strawberry" },
  { emoji: "🍈", name: "Melon" },
  { emoji: "🍒", name: "Cherries" },
  { emoji: "🍑", name: "Peach" },
  { emoji: "🥭", name: "Mango" },
  { emoji: "🍍", name: "Pineapple" },
  { emoji: "🥥", name: "Coconut" },
  { emoji: "🥝", name: "Kiwi Fruit" },
  { emoji: "🍅", name: "Tomato" },
]

export default function OverviewPage() {
  return (
    <Flex direction="column" p={6}>
      <Card>
        <CardBody>
          <Pagination data={MOCK_DATA} pageSize={3}>
            {(pageData) =>
              pageData.map(({ emoji, name }) => (
                <div>
                  {emoji} {name}
                </div>
              ))
            }
          </Pagination>
        </CardBody>
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
        <TransactionHistory gridArea="transaction-history" />
      </Grid>
    </Flex>
  )
}
