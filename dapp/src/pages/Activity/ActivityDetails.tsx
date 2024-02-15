import React from "react"
import { useLocation } from "react-router-dom"
import {
  Card,
  CardBody,
  HStack,
  VStack,
  Image,
  Tag,
  Flex,
} from "@chakra-ui/react"
import { capitalize } from "#/utils"
import ActivityProgress from "#/assets/images/activity-progress.png"
import { LocationState } from "#/types"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import StatusInfo from "#/components/shared/StatusInfo"
import { TextMd, TextSm } from "#/components/shared/Typography"
import Spinner from "#/components/shared/Spinner"

function ActivityDetails() {
  const location = useLocation()

  const { transaction } = location.state as LocationState

  return (
    <Flex flexDirection="column" gap={2}>
      {transaction?.status === "pending" && (
        <Card w="100%">
          <CardBody paddingX={10} paddingY={6}>
            <HStack marginBottom={4} justify="space-between">
              <TextMd>
                <strong>In queue.</strong> Next batch starts in...
              </TextMd>
              <Spinner size="md" />
            </HStack>
            <TextSm>
              Extra informative text. Maximize your earning by using tBTC to
              deposti and redeem BTC in DeFi!
            </TextSm>
          </CardBody>
        </Card>
      )}

      <Card w="100%">
        <CardBody padding={10}>
          <HStack>
            <VStack gap={0} w={72} alignItems="left">
              <TextMd fontWeight="semibold" color="gold.700">
                {capitalize(transaction.action)}
              </TextMd>
              <CurrencyBalance
                variant="greater-balance-xxl"
                desiredDecimals={4}
                currency={transaction.currency}
                amount={transaction.amount}
                symbolFontWeight="medium"
              />
              {/* TODO: Change the balance when calculation functionality is ready */}
              <TextSm marginBottom={7}>(62,317.15 USD)</TextSm>

              {transaction?.status && (
                <Tag mt={2}>
                  <StatusInfo
                    status={transaction.status}
                    fontWeight="semibold"
                    withIcon
                    withDefaultColor
                  />
                </Tag>
              )}
            </VStack>
            <Image src={ActivityProgress} />
          </HStack>
        </CardBody>
      </Card>
    </Flex>
  )
}

export default ActivityDetails
