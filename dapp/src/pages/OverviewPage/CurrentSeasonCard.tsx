import React from "react"
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Flex,
  Tag,
  Text,
} from "@chakra-ui/react"
import { getNumberWithSeparator } from "#/utils"
import { TextMd } from "#/components/shared/Typography"

type CurrentSeasonCardProps = CardProps & {
  heading: React.ReactNode
  timestamp: number
  totalJoined?: number
  tvl?: number
}

export function CurrentSeasonCard(props: CurrentSeasonCardProps) {
  const { heading, timestamp, totalJoined, tvl, ...restProps } = props
  return (
    <Card
      bg="brand.400"
      borderWidth={0}
      gap={4}
      rounded="xl"
      px={5}
      py={4}
      {...restProps}
    >
      <Tag>Live</Tag>

      <CardHeader
        p={0}
        color="gold.100"
        fontSize="2xl"
        lineHeight={1}
        fontWeight="bold"
        letterSpacing="-0.03rem" // -0.48px
      >
        {heading}
      </CardHeader>

      <CardBody p={0} display="contents">
        <Box>
          {/* TODO: Add `CountdownTimer` component when merged */}
          {timestamp}
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
      {/* TODO: Add `Background` component when merged */}
    </Card>
  )
}
