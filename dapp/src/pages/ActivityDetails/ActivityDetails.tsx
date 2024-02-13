import React from "react"
import { useLocation } from "react-router-dom"
import { Card, CardBody, HStack, VStack, Image, Tag } from "@chakra-ui/react"
import { capitalize } from "#/utils"
import ActivityDetailsImg from "#/assets/images/activity-details.png"
import { LocationState } from "#/types"
import { TextMd, TextSm } from "../../components/shared/Typography"
import { CurrencyBalance } from "../../components/shared/CurrencyBalance"
import StatusInfo from "../../components/shared/StatusInfo"
import Spinner from "../../components/shared/Spinner"

function ActivityDetails() {
  const location = useLocation()

  const { transaction } = location.state as LocationState

  if (!transaction) {
    return null
  }

  return (
    <VStack>
      {transaction?.callTx.status === "pending" && (
        <Card w="3xl">
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

      <Card w="3xl">
        <CardBody padding={10}>
          <HStack>
            <VStack gap={0} w={72} alignItems="left">
              <TextMd fontWeight="semibold" color="gold.700">
                {capitalize(transaction.receiptTx.action)}
              </TextMd>
              <CurrencyBalance
                variant="greater-balance-xxl"
                desiredDecimals={4}
                currency={transaction.receiptTx.currency}
                amount={transaction.receiptTx.amount}
                symbolFontWeight="medium"
              />
              {/* TODO: Change the balance when calculation functionality is ready */}
              <TextSm marginBottom={7}>(62,317.15 USD)</TextSm>

              {transaction?.callTx.status && (
                <Tag mt={2}>
                  <StatusInfo
                    status={transaction.callTx.status}
                    fontWeight="semibold"
                    withIcon
                    withDefaultColor
                  />
                </Tag>
              )}
            </VStack>
            <Image justifyItems="right" src={ActivityDetailsImg} />
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default ActivityDetails
