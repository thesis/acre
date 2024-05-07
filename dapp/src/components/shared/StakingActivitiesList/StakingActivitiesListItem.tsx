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
import { LoadingSpinnerSuccessIcon } from "#/assets/icons"
import ButtonLink from "../ButtonLink"
import { CurrencyBalance } from "../CurrencyBalance"
import Spinner from "../Spinner"

export type StakingActivitiesListItemType = {
  id: string
  amount: AmountType
  status: "pending" | "success"
  transactionUrl?: string
  estimatedTime?: number
  isUnstaking?: boolean
}

type StakingActivitiesListItemProps = Omit<AlertProps, "status"> &
  StakingActivitiesListItemType & {
    handleDismiss?: () => void
  }

function StakingActivitiesListItem(props: StakingActivitiesListItemProps) {
  const {
    amount,
    estimatedTime,
    status,
    transactionUrl,
    isUnstaking = false,
    handleDismiss,
    ...restProps
  } = props

  return (
    <Alert as={HStack} variant="process" {...restProps}>
      <AlertIcon
        color="brand.400"
        as={status === "success" ? LoadingSpinnerSuccessIcon : Spinner}
      />

      <VStack flex={1} spacing={0} align="stretch">
        <HStack justify="space-between" as={AlertTitle}>
          <Text as="span">
            {status === "success"
              ? `${isUnstaking ? "Unstaking" : "Staking"} completed`
              : `${isUnstaking ? "Unstaking" : "Staking"}...`}
          </Text>

          <CurrencyBalance amount={amount} currency="bitcoin" />
        </HStack>
        <HStack justify="space-between" as={AlertDescription}>
          {status === "pending" && estimatedTime ? (
            <>
              <Text as="span">Est. time remaining</Text>
              <Text as="span" fontWeight="bold">
                {new Date(estimatedTime).getHours()}h
              </Text>
            </>
          ) : (
            <Button
              variant="link"
              fontSize="sm"
              lineHeight={5}
              onClick={handleDismiss}
            >
              Ok, dismiss
            </Button>
          )}
        </HStack>
      </VStack>

      {transactionUrl && (
        <ButtonLink
          display="flex"
          my={-4}
          ml={6}
          mr={-6}
          h="auto"
          alignSelf="stretch"
          href={transactionUrl}
          variant="unstyled"
          borderLeftWidth={1}
          borderColor="inherit"
          rounded={0}
          px={4}
          py={5}
          iconSpacing={0}
          iconColor="grey.500"
        >
          <VisuallyHidden>View transaction details</VisuallyHidden>
        </ButtonLink>
      )}
    </Alert>
  )
}

export default StakingActivitiesListItem
