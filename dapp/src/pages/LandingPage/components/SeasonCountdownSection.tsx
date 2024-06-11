import React from "react"
import { Box, VStack, Heading, Flex } from "@chakra-ui/react"

import {
  LiveTag,
  SeasonCountdownSectionBackground,
} from "#/components/shared/SeasonCountdownSection"
import ProgressBar from "#/components/ProgressBar"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { TextLg, TextMd, TextXl } from "#/components/shared/Typography"
import { BENEFITS, SEASON_CAP } from "#/constants"
import BenefitCard from "./BenefitCard"

export default function SeasonCountdownSection() {
  return (
    <Box position="relative" mb={5}>
      <VStack
        spacing={0}
        px={{ base: 6, xl: 0 }}
        pb={12}
        textAlign="center"
        color="grey.700"
      >
        <LiveTag
          mt={-4}
          mb="5.125rem" // 82px
          ring={12}
          ringColor="gold.300"
          position="relative"
          sx={{
            "&::before, &::after": {
              content: "''",
              boxSize: 3.5,
              bgImage:
                "radial-gradient(circle at 100% 100%, transparent 0.875rem, gold.300 0.875rem)",
              position: "absolute",
              top: 4,
              transform: "auto",
            },
          }}
          _before={{
            left: -6,
            rotate: 90,
          }}
          _after={{
            right: -6,
          }}
        />

        <Heading fontSize="5xl" fontWeight="bold" mb={2}>
          Season 1. Staking is live!
        </Heading>

        <TextLg
          fontWeight="medium"
          mb="5.5rem" // 88px
        >
          Season 1 stakers will harvest Mezo points and get priority access to
          Bitcoin yield
        </TextLg>

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

        <TextXl
          display="flex"
          whiteSpace="pre"
          mt={2}
          mb="7.5rem" // 120px
        >
          Season 1 cap{" "}
          <CurrencyBalance size="xl" amount={SEASON_CAP} currency="bitcoin" />
        </TextXl>

        <Flex
          flexDirection={{ base: "column", xl: "row" }}
          gap={5}
          align="stretch"
          w="full"
          maxW="63rem" // 1008px
          mx="auto"
        >
          {BENEFITS.map(({ name, description, imageSrc }) => (
            <BenefitCard
              key={name}
              flex={1}
              header={name}
              icon={{ src: imageSrc }}
            >
              <TextMd>{description}</TextMd>
            </BenefitCard>
          ))}
        </Flex>
      </VStack>

      <SeasonCountdownSectionBackground
        pos="absolute"
        top={0}
        left="50%"
        translateX="-50%"
        transform="auto"
        w="full"
        maxW="125rem" // 2000px
        zIndex={-1}
      />
    </Box>
  )
}
