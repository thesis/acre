import React from "react"
import { Box, Flex } from "@chakra-ui/react"
import SeasonCountdownSection from "./SeasonCountdownSection"

export default function LandingPage() {
  return (
    // TODO: To be removed, changes for testing purposes only
    <Flex w="full" flexFlow="column" px={10} h="400vh">
      <Box h="336px" />
      <SeasonCountdownSection />
    </Flex>
  )
}
