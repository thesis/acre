import React from "react"
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
import ActivityProgress from "#/assets/images/activity-progress.png"
import StatusInfo from "#/components/shared/StatusInfo"
import { TextMd, TextSm } from "#/components/shared/Typography"
import Spinner from "#/components/shared/Spinner"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import { useActivities } from "#/hooks"

function ActivityDetails() {
  const { selectedActivity } = useActivities()

  if (!selectedActivity) return null

  return (
    <Flex flexDirection="column" gap={2}>
      {selectedActivity.status === "pending" && (
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
              <TextMd
                color="gold.700"
                fontWeight="semibold"
                textTransform="capitalize"
              >
                {selectedActivity.action}
              </TextMd>
              <CurrencyBalanceWithConversion
                from={{
                  currency: selectedActivity.currency,
                  amount: selectedActivity.amount,
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
                  status={selectedActivity.status}
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
