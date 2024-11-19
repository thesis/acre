import React from "react"
import { Card, CardBody, CardProps, VStack } from "@chakra-ui/react"
import TransactionHistory from "./TransactionHistory"
import PositionDetails from "./PositionDetails"

export default function DashboardCard(props: CardProps) {
  return (
    <Card p="dashboard_card_padding" overflow="hidden" {...props}>
      <CardBody as={VStack} spacing={10}>
        <PositionDetails />
        <TransactionHistory />
      </CardBody>
    </Card>
  )
}
