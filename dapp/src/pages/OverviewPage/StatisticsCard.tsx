import React, { useEffect, useState } from "react"
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
} from "@chakra-ui/react"
import { StatisticType } from "#/types"
import {
  mockedStakerStatistics,
  mockedProtocolStatistics,
} from "#/mocks/mock-statistics"
import ButtonLink from "#/components/shared/ButtonLink"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { TextSm } from "#/components/shared/Typography"

export default function StatisticsCard(props: CardProps) {
  const [statistics, setStatistic] = useState<StatisticType[]>()
  // TODO: change when staking state will be available
  const isStaking = false

  useEffect(() => {
    if (isStaking) {
      setStatistic(mockedStakerStatistics)
    } else {
      setStatistic(mockedProtocolStatistics)
    }
  }, [isStaking])

  if (!statistics) return null

  return (
    <Card {...props} p={5} pb={2} w={72}>
      <CardBody p={0} mb={2}>
        {statistics.map(({ name, amount, totalAmount }: StatisticType) => (
          <Card
            variant="elevated"
            colorScheme="gold"
            size="md"
            p={4}
            mb={2}
            borderRadius="lg"
            key={name}
          >
            <CardHeader p={0}>
              <TextSm>{name}</TextSm>
            </CardHeader>
            <CardBody p={0}>
              <CurrencyBalance
                size="xl"
                amount={amount}
                currency="bitcoin"
                totalAmount={totalAmount}
              />
            </CardBody>
          </Card>
        ))}
      </CardBody>
      <CardFooter p={0}>
        <ButtonLink
          href="https://dune.com/threshold/tbtc"
          isExternal
          variant="ghost"
          pl={0}
        >
          Dune analytics
        </ButtonLink>
      </CardFooter>
    </Card>
  )
}
