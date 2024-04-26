import React from "react"
import {
  Button,
  CardHeader,
  CardBody,
  Card,
  CardProps,
  Tag,
  HStack,
  VStack,
} from "@chakra-ui/react"
import { TextMd } from "#/components/shared/Typography"
import {
  CurrencyBalance,
  CurrencyBalanceProps,
} from "#/components/shared/CurrencyBalance"

type AmountType = CurrencyBalanceProps["amount"]
type DashboardCardProps = CardProps & {
  bitcoinAmount: AmountType
  usdAmount: AmountType
  // TODO: Make this required in post MVP (ternary operator below should be
  //       removed)
  positionPercentage?: number
}

export default function DashboardCard(props: DashboardCardProps) {
  const { bitcoinAmount, usdAmount, positionPercentage, ...restProps } = props
  return (
    <Card px={5} py={10} gap={10} {...restProps}>
      <CardHeader p={0} textAlign="center">
        {positionPercentage ? (
          <TextMd>
            My position <Tag>Top {positionPercentage}%</Tag>
          </TextMd>
        ) : (
          // TODO: Update when designer provides alternative copy
          <TextMd>Dashboard</TextMd>
        )}
      </CardHeader>
      <CardBody as={VStack} p={0} spacing={10}>
        <VStack justify="center" spacing={6}>
          <VStack justify="center" spacing={0}>
            <CurrencyBalance amount={bitcoinAmount} currency="bitcoin" />
            <CurrencyBalance
              amount={usdAmount}
              currency="usd"
              shouldBeFormatted={false}
            />
          </VStack>

          <Tag>Rewards Boost</Tag>
        </VStack>

        <HStack spacing={2}>
          <Button>Deposit More</Button>
          <Button variant="outline">Withdraw</Button>
        </HStack>
      </CardBody>
    </Card>
  )
}
