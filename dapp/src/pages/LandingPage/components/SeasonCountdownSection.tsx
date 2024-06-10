import React from "react"
import { Box, VStack, Heading, Text } from "@chakra-ui/react"

import {
  LiveTag,
  SeasonCountdownSectionBackground,
} from "#/components/shared/SeasonCountdownSection"
import ProgressBar from "#/components/ProgressBar"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { TextXl } from "#/components/shared/Typography"

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
        <ProgressBar
          size="2xl"
          value={29}
          maxW="50rem" // 800px
        >
          <CurrencyBalance
            amount={24572000000} // TODO: replace with value
            currency="bitcoin"
            variant="greater-balance-xl"
            symbolFontWeight="black"
            // TODO: adjust symbol font size
          />
        </ProgressBar>
        <TextXl mt={2}>
          Season 1 cap{" "}
          <Box as="strong" ml={2}>
            2000,00 BTC
          </Box>
        </TextXl>
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
