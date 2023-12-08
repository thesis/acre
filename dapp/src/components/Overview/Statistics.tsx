import React from "react"
import { CardBody, Card, CardProps } from "@chakra-ui/react"
import { TextMd } from "../Typography"

export default function Statistics(props: CardProps) {
  return (
    <Card {...props}>
      <CardBody>
        <TextMd>Pool stats</TextMd>
      </CardBody>
    </Card>
  )
}
