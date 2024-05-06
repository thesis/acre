import React from "react"
import {
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Tag,
  Text,
} from "@chakra-ui/react"
import { getNumberWithSeparator } from "#/utils"

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
      <CardBody p={0}>{timestamp}</CardBody>
      {/* TODO: Add `CountdownTimer` component when merged */}
      <CardFooter
        p={0}
        display="flex"
        alignItems="baseline"
        justifyContent="space-between"
        fontSize="md"
        fontWeight="medium"
        color="white"
      >
        {totalJoined && (
          <Box>
            Total joined&nbsp;
            <Text as="span" fontWeight="bold">
              {getNumberWithSeparator(totalJoined)}
            </Text>
          </Box>
        )}
        {tvl && (
          <Box>
            TVL&nbsp;
            <Text as="span" fontWeight="bold">
              {getNumberWithSeparator(tvl)} BTC
            </Text>
          </Box>
        )}
      </CardFooter>
      {/* TODO: Add `Background` component when merged */}
    </Card>
  )
}
