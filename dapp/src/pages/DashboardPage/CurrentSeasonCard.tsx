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
import { AmountType } from "#/types"

type CurrentSeasonCardProps = StackProps & {
  heading: React.ReactNode
  timestamp: number
  totalJoined?: number
  tvl?: AmountType
}

export function CurrentSeasonCard(props: CurrentSeasonCardProps) {
  const { heading, timestamp, totalJoined, tvl, ...restProps } = props
  return (
    <VStack
      bg="transparent"
      borderWidth={0}
      spacing={4}
      px={5}
      py={4}
      w="full"
      align="start"
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
        {heading}
      </Heading>

      <CountdownTimer size="sm" timestamp={timestamp} />

      <Flex align="baseline" justify="space-between" color="white">
        {totalJoined && (
          <TextMd fontWeight="medium">
            Total joined&nbsp;
            <TextMd as="span" fontWeight="bold">
              {numberToLocaleString(totalJoined)}
            </TextMd>
          </TextMd>
        )}
        {!!tvl && (
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
        )}
      </Flex>

      <SeasonCountdownSectionBackground
        position="absolute"
        inset={0}
        zIndex={-1}
      />
    </VStack>
  )
}
