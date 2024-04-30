import React from "react"
import { AmountType } from "#/types"
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertProps,
  AlertTitle,
  Button,
  HStack,
  Text,
  VStack,
  VisuallyHidden,
} from "@chakra-ui/react"
import ButtonLink from "../ButtonLink"
import { CurrencyBalance } from "../CurrencyBalance"

export type StakingActivitiesListItemType = {
  amount: AmountType
  status: "pending" | "success"
  transactionUrl?: string
  estimatedTime?: number
}

type StakingActivitiesListItemProps = Omit<AlertProps, "status"> &
  StakingActivitiesListItemType

function StakingActivitiesListItem(props: StakingActivitiesListItemProps) {
  const { amount, estimatedTime, status, transactionUrl, ...restProps } = props

  return (
    <Alert as={HStack} variant="process" {...restProps}>
      <AlertIcon />

      <VStack>
        <HStack justify="space-between" as={AlertTitle}>
          <Text as="span">
            {status === "success" ? "Staking completed" : "Staking..."}
          </Text>

          <CurrencyBalance amount={amount} currency="bitcoin" />
        </HStack>

        <HStack justify="space-between" as={AlertDescription}>
          {status === "pending" && estimatedTime ? (
            <>
              <Text as="span">Est. time remaining:</Text>
              <Text as="span">{new Date(estimatedTime).getHours()}h</Text>
            </>
          ) : (
            <Button variant="link">Ok, dismiss</Button>
          )}
        </HStack>
      </VStack>

      {transactionUrl && (
        <ButtonLink href={transactionUrl}>
          <VisuallyHidden>View transaction details</VisuallyHidden>
        </ButtonLink>
      )}
    </Alert>
  )
}

export default StakingActivitiesListItem
