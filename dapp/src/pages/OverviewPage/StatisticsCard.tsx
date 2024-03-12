import React from "react"
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
} from "@chakra-ui/react"
import { StatisticType } from "#/types"
import ButtonLink from "#/components/shared/ButtonLink"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { TextSm } from "#/components/shared/Typography"
import { useStakingStats } from "#/hooks"
import { LINKS } from "#/constants"

export default function StatisticsCard(props: CardProps) {
  const statistics = useStakingStats()

  return (
    <Card p={5} pb={2} w={72} {...props}>
      <CardBody p={0} mb={2}>
        {statistics?.map(({ name, amount, totalAmount }: StatisticType) => (
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
          href={LINKS.tbtcDuneDashboard}
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
