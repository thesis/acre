import React from "react"
import { Box, Flex } from "@chakra-ui/react"
import SeasonCountdownSection from "./SeasonCountdownSection"
import HeroSection from "./HeroSection"

export default function LandingPage() {
  return (
    <Flex
      w="full"
      flexFlow="column"
      px={16} // 40px + 24px
      pb={10}
      maxW="87.25rem" // 1268px + 2 * (40px + 24px)
      mx="auto"
    >
      <HeroSection />
      <SeasonCountdownSection />
    </Flex>
  )
}
