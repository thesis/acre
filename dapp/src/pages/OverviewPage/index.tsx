import React from "react"
import { Flex, Grid, HStack, Switch } from "@chakra-ui/react"
import { TextSm } from "#/components/shared/Typography"
import { USD } from "#/constants"
import { chakraUnitToPx } from "#/theme/utils"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"
import { DocsCard } from "./DocsCard"
import { ActivityCarousel } from "./ActivityCarousel"
import { CurrentSeasonCard } from "./CurrentSeasonCard"
import PageLayout from "./PageLayout"

export default function OverviewPage() {
  return (
    <PageLayout
      leftSidebar={
        <PageLayout.Sidebar>
          <CurrentSeasonCard
            heading={
              <>
                Season 1<br />
                Pre-launch staking
              </>
            }
            timestamp={new Date().getTime() / 1000}
            totalJoined={3045}
            tvl={1981}
          />
        </PageLayout.Sidebar>
      }
      rightSidebar={
        <PageLayout.Sidebar>
          <CurrentSeasonCard
            heading={
              <>
                Season 1<br />
                Pre-launch staking
              </>
            }
            timestamp={new Date().getTime() / 1000}
            totalJoined={3045}
            tvl={1981}
          />
        </PageLayout.Sidebar>
      }
    >
      Content
    </PageLayout>
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
