import React from "react"
import {
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
import { TokenBalance } from "../shared/TokenBalance"
import { TextMd } from "../shared/Typography"

export default function PositionDetails(props: CardProps) {
  return (
    <Card {...props}>
      <CardBody>
        <HStack justifyContent="space-between">
          <TextMd fontWeight="bold">Your position</TextMd>
          {/* TODO: Add correct text for tooltip */}
          <Tooltip label="Template" placement="top">
            <Icon as={Info} color="grey.700" />
          </Tooltip>
        </HStack>
        <TokenBalance
          token={{
            currency: BITCOIN,
            amount: "2398567898",
            variant: "greater-balance",
          }}
          fiatCurrency={{
            currency: USD,
            amount: 419288.98,
            shouldBeFormatted: false,
            size: "lg",
          }}
        />
      </CardBody>
      <CardFooter flexDirection="column" gap={2}>
        {/* TODO: Handle click actions */}
        <Button size="lg">Stake</Button>
        <Button size="lg" variant="outline">
          Unstake
        </Button>
      </CardFooter>
    </Card>
  )
}
