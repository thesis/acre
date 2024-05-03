/* eslint-disable @typescript-eslint/no-unused-vars */
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
import IconTag from "#/components/shared/IconTag"
import { BoostArrowIcon } from "#/assets/icons"

type AmountType = CurrencyBalanceProps["amount"]
type DashboardCardProps = CardProps & {
  bitcoinAmount: AmountType
  usdAmount: AmountType
  positionPercentage?: number // TODO: Make this required in post MVP phase
}

export default function DashboardCard(props: DashboardCardProps) {
  const { bitcoinAmount, usdAmount, positionPercentage, ...restProps } = props
  return (
    <Card px={5} py={10} gap={10} {...restProps}>
      <CardHeader p={0} textAlign="center">
        <TextMd fontWeight="bold">
          My position
          {positionPercentage && (
            <Tag
              px={3}
              py={1}
              ml={2}
              borderWidth={0}
              color="gold.100"
              bg="gold.700"
              fontWeight="bold"
              lineHeight={5}
              verticalAlign="baseline"
            >
              Top {positionPercentage}%
            </Tag>
          )}
        </TextMd>
      </CardHeader>
      <CardBody as={VStack} p={0} spacing={10}>
        <VStack justify="center" spacing={6}>
          <VStack justify="center" spacing={0}>
            <CurrencyBalance
              amount={bitcoinAmount}
              currency="bitcoin"
              fontSize="6xl"
              lineHeight={1.2}
              letterSpacing="-0.075rem" // -1.2px
              fontWeight="bold"
              color="grey.700"
            />
            <CurrencyBalance
              amount={usdAmount}
              currency="usd"
              shouldBeFormatted={false}
              color="grey.500"
              fontWeight="medium"
            />
          </VStack>

          <IconTag icon={BoostArrowIcon}>Rewards Boost</IconTag>
        </VStack>

        <HStack w="full" justify="center" spacing={2}>
          <Button
            flex={1}
            maxW="12.5rem" // 200px
            size="xl"
          >
            Deposit More
          </Button>
          <Button
            flex={1}
            maxW="12.5rem" // 200px
            size="xl"
            variant="outline"
          >
            Withdraw
          </Button>
        </HStack>
      </CardBody>
    </Card>
  )
}
