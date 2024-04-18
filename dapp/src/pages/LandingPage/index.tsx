import React from "react"
import { Flex } from "@chakra-ui/react"
import HeroSection from "./HeroSection"

export default function LandingPage() {
  return (
    <Flex w="full" flexFlow="column" px={10}>
      <HeroSection />
    </Flex>
  )
}
