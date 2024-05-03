import React from "react"
import { Flex } from "@chakra-ui/react"
import {
  SeasonCountdownSection,
  HeroSection,
} from "#/pages/LandingPage/components"

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
