import React, { useMemo } from "react"
import { Box, Flex, VStack, HStack } from "@chakra-ui/react"
import boostCardIcon from "#/assets/images/card-icon-boost-arrow.png"
import misteryCardIcon from "#/assets/images/card-icon-question-mark.png"
import { useCountdown } from "#/hooks"
import IconCard from "./IconCard"

const MOCK_SEASON_DUE_TIMESTAMP = new Date(2024, 3, 20).getTime() / 1000

export default function LandingPage() {
  const countdown = useCountdown(MOCK_SEASON_DUE_TIMESTAMP)
  const unlockableDuePeriod = useMemo(
    () =>
      Object.entries(countdown)
        .filter(([label]) => label !== "seconds")
        .reduce(
          (acc, [label, value]) =>
            `${acc} ${value}${label.charAt(0).toLowerCase()}`,
          "",
        )
        .trim(),
    [countdown],
  )

  return (
    // TODO: To be removed, changes for testing purposes only
    <Flex w="full" flexFlow="column" px={10} h="400vh">
      <Box h="336px" />
      <VStack spacing={4} mx={32}>
        <HStack spacing={5} align="stretch" mb={1} w="full">
          <IconCard
            flex={1}
            header="Rewards Boost"
            body="Platinum Boost"
            icon={{ src: boostCardIcon, maxH: 239 }}
          />
          <IconCard
            flex={1}
            header="Mystery Box"
            body={`Unlockable in ${unlockableDuePeriod}`}
            icon={{ src: misteryCardIcon, maxH: 177 }}
          />
        </HStack>
      </VStack>
    </Flex>
  )
}
