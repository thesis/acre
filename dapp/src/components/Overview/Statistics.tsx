import React from "react"
import { CardBody, Card, CardProps } from "@chakra-ui/react"
import { TextMd } from "#/components/shared/Typography"
import { PoolStats } from "../PoolStats"

export default function Statistics(props: CardProps) {
  return (
    <Card {...props}>
      <CardBody>
        <TextMd fontWeight="bold">Pool stats</TextMd>
        <PoolStats />
      </CardBody>
    </Card>
  )
}
