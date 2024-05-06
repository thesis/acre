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
    <Card variant="current-season" {...restProps}>
      <Tag>Live</Tag>
      <CardHeader>{heading}</CardHeader>
      <CardBody>{timestamp}</CardBody>
      {/* TODO: Add `CountdownTimer` component when merged */}
      <CardFooter>
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
