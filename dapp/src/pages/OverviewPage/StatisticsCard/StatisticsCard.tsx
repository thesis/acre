import React from "react"
import { Card, CardFooter, CardProps } from "@chakra-ui/react"
import ButtonLink from "#/components/shared/ButtonLink"
import { useStakingStats } from "#/hooks"
import { LINKS } from "#/constants"
import { ProtocolStatisticCard } from "./ProtocolStatisticCard"
import { StakerStatisticCard } from "./StakerStatisticCard"

export function StatisticsCard(props: CardProps) {
  const { isStaking, statistics } = useStakingStats()

  if (!statistics) return null

  return (
    <Card p={5} pb={2} w={72} {...props}>
      {isStaking ? (
        <StakerStatisticCard statistics={statistics} />
      ) : (
        <ProtocolStatisticCard statistics={statistics} />
      )}
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
