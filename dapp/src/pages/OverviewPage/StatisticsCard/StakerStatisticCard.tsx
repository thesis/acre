import React from "react"
import { Card, CardBody, CardHeader } from "@chakra-ui/react"
import { ProtocolStatistics } from "#/types"
import { CurrencyBalance } from "#/components/shared/Balance/CurrencyBalance"
import { TextSm } from "#/components/shared/Typography"

export function StakerStatisticCard({
  statistics,
}: {
  statistics: ProtocolStatistics
}) {
  return (
    <CardBody p={0} mb={2}>
      <Card
        variant="elevated"
        colorScheme="gold"
        size="md"
        p={4}
        mb={2}
        borderRadius="lg"
      >
        <CardHeader p={0}>
          <TextSm>Total Earned Yield</TextSm>
        </CardHeader>
        <CardBody p={0}>
          <CurrencyBalance
            size="xl"
            amount={statistics.tvl}
            currency="bitcoin"
          />
        </CardBody>
      </Card>
      <Card
        variant="elevated"
        colorScheme="gold"
        size="md"
        p={4}
        mb={2}
        borderRadius="lg"
      >
        <CardHeader p={0}>
          <TextSm>7-day yield</TextSm>
        </CardHeader>
        <CardBody p={0}>
          <CurrencyBalance
            size="xl"
            amount={statistics.apy.weekly}
            desiredDecimals={8}
            currency="bitcoin"
          />
        </CardBody>
      </Card>
      <Card
        variant="elevated"
        colorScheme="gold"
        size="md"
        p={4}
        mb={2}
        borderRadius="lg"
      >
        <CardHeader p={0}>
          <TextSm>30-day yield</TextSm>
        </CardHeader>
        <CardBody p={0}>
          <CurrencyBalance
            size="xl"
            amount={statistics.apy.quarterly}
            desiredDecimals={8}
            currency="bitcoin"
          />
        </CardBody>
      </Card>
    </CardBody>
  )
}
