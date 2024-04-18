import React from "react"
import { Flex } from "@chakra-ui/react"
import SeasonCountdownSection from "./SeasonCountdownSection"

export default function LandingPage() {
  return (
    <Flex w="full" flexFlow="column" px={10}>
      <SeasonCountdownSection />
    </Flex>
  )
}
