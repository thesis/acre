import React from "react"
import { Flex, Grid, HStack, Switch } from "@chakra-ui/react"
import { useDocsDrawer, useWalletContext } from "#/hooks"
import { TextSm } from "#/components/shared/Typography"
import { USD } from "#/constants"
import { chakraUnitToPx } from "#/theme/utils"
import ButtonLink from "#/components/shared/ButtonLink"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"
import { DocsCard } from "./DocsCard"
import { ActivityCarousel } from "./ActivityCarousel"

export default function OverviewPage() {
  const { onOpen } = useDocsDrawer()
  const { isConnected } = useWalletContext()

  return (
    <Flex direction="column" gap={isConnected ? 3.5 : 2} p={6}>
      <Flex justifyContent="space-between">
        <HStack>
          {/* TODO: Handle click actions */}
          <Switch size="sm" />
          <TextSm fontWeight="bold">Show values in {USD.symbol}</TextSm>
        </HStack>
        {!isConnected && (
          <ButtonLink colorScheme="gold" bg="gold.200" onClick={onOpen}>
            Docs
          </ButtonLink>
        )}
      </Flex>
      {/* TODO: Add animation to show activity bar */}
      {isConnected && (
        <Grid
          templateAreas={'"activity-carousel docs-card"'}
          gridTemplateColumns={`calc(100% - ${chakraUnitToPx(64)}px) auto`}
        >
          <ActivityCarousel gridArea="activity-carousel" />
          <DocsCard gridArea="docs-card" />
        </Grid>
      )}
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
