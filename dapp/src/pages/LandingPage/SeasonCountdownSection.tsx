import React from "react"
import { Box, VStack, Heading, Text } from "@chakra-ui/react"

import {
  LiveTag,
  SeasonCountdownSectionBackground,
  CountdownTimer,
} from "#/components/shared/SeasonCountdownSection"

const MOCK_SEASON_DUE_TIMESTAMP = new Date(2024, 3, 20).getTime() / 1000

export default function SeasonCountdownSection() {
  return (
    <Box position="relative">
      <VStack
        spacing={0}
        px={10}
        pt={15}
        pb={30}
        textAlign="center"
        color="white"
      >
        <LiveTag mb={10} />
        <Heading fontSize="5xl" fontWeight="bold" mb={4}>
          Season 1. Pre-launch staking
        </Heading>
        <Text fontSize="lg" fontWeight="medium" mb={10}>
          Season 1 users that stake bitcoin before Acre launches earn the <br />
          highest rewards and first access to upcoming Seasons.
        </Text>
        <CountdownTimer timestamp={MOCK_SEASON_DUE_TIMESTAMP} />
      </VStack>
      <SeasonCountdownSectionBackground />
    </Box>
  )
}
