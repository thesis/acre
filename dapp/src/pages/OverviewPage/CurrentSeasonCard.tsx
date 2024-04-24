import React from "react"
import {
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Tag,
} from "@chakra-ui/react"

export function CurrentSeasonCard(props: CardProps) {
  return (
    <Card {...props}>
      <CardHeader>
        <Tag>Live</Tag>
        Season 1.
        <br />
        Pre-launch staking
      </CardHeader>
      <CardBody>
        <Box>02 23 12</Box>
      </CardBody>
      <CardFooter>
        <Box>Total joined 3,045</Box>
        <Box>TVL 1,445 BTC</Box>
      </CardFooter>
    </Card>
  )
}
