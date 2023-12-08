import React from "react"
import {
  Text,
  Button,
  Tooltip,
  Icon,
  useColorModeValue,
  CardBody,
  Card,
  CardFooter,
} from "@chakra-ui/react"
import { BITCOIN, USD } from "../../constants"
import { Info } from "../../static/icons"

export default function PositionDetails() {
  return (
    <Card h="100%">
      <CardBody>
        <Text>Your positions</Text>
        <Text>
          34.75 <Text as="span">{BITCOIN.symbol}</Text>
        </Text>
        <Text>
          1.245.148,1 <Text as="span">{USD.symbol}</Text>
          {/* TODO: Add correct text for tooltip */}
          <Tooltip label="Template">
            <Icon as={Info} color={useColorModeValue("black", "grey.80")} />
          </Tooltip>
        </Text>
      </CardBody>
      <CardFooter flexDirection="column" gap={2}>
        {/* TODO: Handle click actions */}
        <Button>Stake</Button>
        <Button variant="outline">Withdraw</Button>
      </CardFooter>
    </Card>
  )
}
