import React from "react"
import {
  Text,
  Button,
  Tooltip,
  Icon,
  CardBody,
  Card,
  CardFooter,
  HStack,
  CardProps,
} from "@chakra-ui/react"
import { BITCOIN, USD } from "../../constants"
import { Info } from "../../static/icons"

export default function PositionDetails(props: CardProps) {
  return (
    <Card {...props}>
      <CardBody>
        <HStack justifyContent="space-between">
          <Text>Your positions</Text>
          {/* TODO: Add correct text for tooltip */}
          <Tooltip label="Template">
            <Icon as={Info} color="grey.700" />
          </Tooltip>
        </HStack>
        <Text>
          34.75 <Text as="span">{BITCOIN.symbol}</Text>
        </Text>
        <Text>
          1.245.148,1 <Text as="span">{USD.symbol}</Text>
        </Text>
      </CardBody>
      <CardFooter flexDirection="column" gap={2}>
        {/* TODO: Handle click actions */}
        <Button size="lg">Stake</Button>
        <Button size="lg" variant="outline">
          Withdraw
        </Button>
      </CardFooter>
    </Card>
  )
}
