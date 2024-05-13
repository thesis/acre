import React from "react"
import { LoadingSpinnerSuccessIcon } from "#/assets/icons"
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
import Spinner from "../Spinner"

export type ActivitiesListItemType = {
  id: string
  amount: AmountType
  status: "pending" | "success"
  transactionUrl?: string
  // estimatedTime?: number             // TODO: To implement. Estimated activity time is not in scope of MVP.
  isUnstaking?: boolean
}

type ActivitiesListItemProps = Omit<AlertProps, "status"> &
  ActivitiesListItemType & {
    handleDismiss?: () => void
  }

function ActivitiesListItem(props: ActivitiesListItemProps) {
  const {
    amount,
    // estimatedTime,
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
          {status === "success" ? (
            <Button
              variant="link"
              fontSize="sm"
              lineHeight={5}
              onClick={handleDismiss}
            >
              Ok, dismiss
            </Button>
          ) : (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {/* <Text as="span">Est. time remaining</Text>
              <Text as="span" fontWeight="bold">
                {new Date(estimatedTime).getHours()}h
              </Text> */}
            </>
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

export default ActivitiesListItem
