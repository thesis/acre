import React from "react"
import { StackProps, Flex, VStack, Heading } from "@chakra-ui/react"
import { numberToLocaleString } from "#/utils"
import { TextMd } from "#/components/shared/Typography"
import {
  CountdownTimer,
  LiveTag,
  SeasonCountdownSectionBackground,
} from "#/components/shared/SeasonCountdownSection"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { SEASON_DUE_TIMESTAMP } from "#/constants"

type CurrentSeasonCardProps = StackProps & {
  showSeasonStats?: boolean
}

export function CurrentSeasonCard(props: CurrentSeasonCardProps) {
  const { showSeasonStats = true, ...restProps } = props

  const totalJoined = 3045 // TODO: fetch from API
  const tvl = 144500000000 // TODO: fetch from API

  return (
    <VStack
      spacing={4}
      px={5}
      py={4}
      w="full"
      align="stretch"
      position="relative"
      {...restProps}
    >
      <LiveTag fontSize="sm" px={3} py={1} gap={2} />

      <Heading
        as="p"
        color="gold.100"
        fontSize="2xl"
        lineHeight={1}
        letterSpacing="-0.03rem" // -0.48px
      >
        Season 1 <br />
        Pre-launch staking
      </Heading>

      <CountdownTimer size="sm" timestamp={SEASON_DUE_TIMESTAMP} />

      {showSeasonStats && (
        <Flex align="baseline" justify="space-between" color="white">
          <TextMd fontWeight="medium">
            Total joined&nbsp;
            <TextMd as="span" fontWeight="bold">
              {numberToLocaleString(totalJoined)}
            </TextMd>
          </TextMd>

          <TextMd display="flex" fontWeight="medium">
            TVL&nbsp;
            <CurrencyBalance
              as="span"
              amount={tvl}
              currency="bitcoin"
              fontSize="md"
              fontWeight="bold"
            />
          </TextMd>
        </Flex>
      )}

      <SeasonCountdownSectionBackground
        position="absolute"
        inset={0}
        zIndex={-1}
      />
    </VStack>
  )
}
