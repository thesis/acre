import React from "react"
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Flex,
} from "@chakra-ui/react"
import { getNumberWithSeparator } from "#/utils"
import { TextMd } from "#/components/shared/Typography"
import {
  CountdownTimer,
  LiveTag,
  SeasonCountdownSectionBackground,
} from "#/components/shared/SeasonCountdownSection"

type CurrentSeasonCardProps = Omit<CardProps, "position" | "pos"> & {
  heading: React.ReactNode
  timestamp: number
  totalJoined?: number
  tvl?: number
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
        <Box>
          <CountdownTimer size="sm" timestamp={timestamp} />
        </Box>

        <Flex align="baseline" justify="space-between" color="white">
          {totalJoined && (
            <TextMd fontWeight="medium">
              Total joined&nbsp;
              <TextMd as="span" fontWeight="bold">
                {getNumberWithSeparator(totalJoined)}
              </TextMd>
            </TextMd>
          )}
          {tvl && (
            <TextMd fontWeight="medium">
              TVL&nbsp;
              <TextMd as="span" fontWeight="bold">
                {getNumberWithSeparator(tvl)} BTC
              </TextMd>
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
