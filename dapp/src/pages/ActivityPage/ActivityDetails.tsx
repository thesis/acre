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
  Text,
} from "@chakra-ui/react"
import { capitalize } from "#/utils"
import ActivityProgress from "#/assets/images/activity-progress.png"
import { LocationState } from "#/types"
import StatusInfo from "#/components/shared/StatusInfo"
import { TextMd, TextSm } from "#/components/shared/Typography"
import Spinner from "#/components/shared/Spinner"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"

function ActivityDetails() {
  const location = useLocation()

  const { activity } = location.state as LocationState

  return (
    <Flex flexDirection="column" gap={2}>
      {activity.status === "pending" && (
        <Card>
          <CardBody paddingX={10} paddingY={6}>
            <HStack marginBottom={4} justify="space-between">
              <TextMd>
                <Text as="b">In queue.</Text> Next batch starts in...
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

      <Card>
        <CardBody padding={10}>
          <HStack>
            <VStack gap={0} w={72} alignItems="left">
              <TextMd fontWeight="semibold" color="gold.700">
                {capitalize(activity.action)}
              </TextMd>
              <CurrencyBalanceWithConversion
                from={{
                  currency: activity.currency,
                  amount: activity.amount,
                  variant: "greater-balance-xxl",
                  symbolFontWeight: "medium",
                }}
                to={{
                  currency: "usd",
                  fontWeight: "medium",
                }}
              />
              <Tag mt={9}>
                <StatusInfo
                  status={activity.status}
                  fontWeight="medium"
                  withIcon
                  withDefaultColor
                />
              </Tag>
            </VStack>
            <Image src={ActivityProgress} />
          </HStack>
        </CardBody>
      </Card>
    </Flex>
  )
}

export default ActivityDetails
