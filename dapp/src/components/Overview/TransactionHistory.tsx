import React from "react"
import { CardBody, Card } from "@chakra-ui/react"
import { TextMd } from "../Typography"

export default function TransactionHistory() {
  return (
    <Card h="100%">
      <CardBody>
        <TextMd>Transaction history</TextMd>
      </CardBody>
    </Card>
  )
}
