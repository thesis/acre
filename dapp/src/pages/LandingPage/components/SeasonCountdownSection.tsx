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
    <Box display="grid" sx={{ ">*": { gridArea: "-1 / -1" } }}>
      <VStack
        spacing={0}
        px={10}
        pt={15}
        pb={20}
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
      <SeasonCountdownSectionBackground
        pos="absolute"
        left="50%"
        translateX="-50%"
        transform="auto"
        w="calc(100% - 2 * 2.5rem)" // 100% - 2 * 40px
        maxW="125rem" // 2000px
        maxH="43rem" // 688px
        zIndex={-1}
      />
    </Box>
  )
}
