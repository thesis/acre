import React from "react"
import { Button, Heading, VStack, Text } from "@chakra-ui/react"

function HeroSection() {
  return (
    <VStack spacing={0} mt={13} mb={20}>
      <Heading fontSize="6xl" mb={2} fontWeight="semibold">
        Bitcoin staking done right.
      </Heading>
      <Text fontSize="xl" lineHeight={7} mb={10} fontWeight="medium">
        The open source, decentralized way to grow your bitcoin
      </Text>
      <Button size="lg" px={7} fontWeight="bold" lineHeight={6} h="auto">
        Deposit BTC
      </Button>
    </VStack>
  )
}

export default HeroSection
