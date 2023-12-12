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
import { CurrencyBalance } from "../shared/CurrencyBalance"
import { HMd, TextLg, TextMd, TextXl } from "../shared/Typography"

export default function PositionDetails(props: CardProps) {
  return (
    <Card {...props}>
      <CardBody>
        <HStack justifyContent="space-between">
          <TextMd fontWeight="bold">Your position</TextMd>
          {/* TODO: Add correct text for tooltip */}
          <Tooltip label="Template">
            <Icon as={Info} color="grey.700" />
          </Tooltip>
        </HStack>
        <CurrencyBalance
          currency={BITCOIN}
          amount="2398567898"
          balanceTag={HMd}
          symbolTag={TextXl}
          balanceProps={{ fontWeight: "bold" }}
          symbolProps={{ fontWeight: "semibold" }}
        />
        <CurrencyBalance
          currency={USD}
          amount={419288.98}
          shouldBeFormatted={false}
          balanceTag={TextLg}
          symbolTag={TextLg}
          balanceProps={{ fontWeight: "semibold" }}
          symbolProps={{ fontWeight: "semibold" }}
        />
      </CardBody>
      <CardFooter flexDirection="column" gap={2}>
        {/* TODO: Handle click actions */}
        <Button>Stake</Button>
        <Button variant="outline">Withdraw</Button>
      </CardFooter>
    </Card>
  )
}
