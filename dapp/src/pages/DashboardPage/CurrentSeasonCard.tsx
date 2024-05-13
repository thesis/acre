import React from "react"
import { Card, CardBody, CardHeader, CardProps, Flex } from "@chakra-ui/react"
import { numberToLocaleString } from "#/utils"
import { TextMd } from "#/components/shared/Typography"
import {
  CountdownTimer,
  LiveTag,
  SeasonCountdownSectionBackground,
} from "#/components/shared/SeasonCountdownSection"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { AmountType } from "#/types"

type CurrentSeasonCardProps = Omit<CardProps, "position" | "pos"> & {
  heading: React.ReactNode
  timestamp: number
  totalJoined?: number
  tvl?: AmountType
}

export function CurrentSeasonCard(props: CurrentSeasonCardProps) {
  const { heading, timestamp, totalJoined, tvl, ...restProps } = props
  return (
    <Card
      bg="transparent"
      borderWidth={0}
      gap={4}
      rounded="xl"
      px={5}
      py={4}
      w="full"
      position="relative"
      {...restProps}
    >
      <LiveTag fontSize="sm" px={3} py={1} gap={2} />

      <CardHeader
        as="p"
        p={0}
        color="gold.100"
        fontSize="2xl"
        lineHeight={1}
        fontWeight="bold"
        letterSpacing="-2%"
      >
        {heading}
      </CardHeader>

      <CardBody p={0} display="contents">
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
      </CardBody>
      <SeasonCountdownSectionBackground
        position="absolute"
        inset={0}
        zIndex={-1}
      />
    </Card>
  )
}
