import React from "react"
import { ArrowUpRight, LoadingSpinnerSuccessIcon } from "#/assets/icons"
import { Activity as ActivityType } from "#/types"
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
import { CurrencyBalance } from "../CurrencyBalance"
import Spinner from "../Spinner"
import BlockExplorerLink from "../BlockExplorerLink"

type ActivitiesListItemProps = Omit<AlertProps, "status"> &
  ActivityType & {
    handleDismiss?: () => void
  }

function ActivitiesListItem(props: ActivitiesListItemProps) {
  const { amount, status, txHash, type, handleDismiss, ...restProps } = props

  return (
    <Alert as={HStack} variant="process" {...restProps}>
      <AlertIcon
        color="brand.400"
        as={status === "completed" ? LoadingSpinnerSuccessIcon : Spinner}
      />

      <VStack flex={1} spacing={0} align="stretch">
        <HStack justify="space-between" as={AlertTitle}>
          <Text as="span">
            {status === "completed"
              ? `${type === "withdraw" ? "Unstaking" : "Staking"} completed`
              : `${type === "withdraw" ? "Unstaking" : "Staking"}...`}
          </Text>

          <CurrencyBalance amount={amount} currency="bitcoin" />
        </HStack>
        <HStack justify="space-between" as={AlertDescription}>
          {status === "completed" ? (
            <Button
              variant="link"
              fontSize="sm"
              lineHeight={5}
              onClick={handleDismiss}
            >
              Ok, dismiss
            </Button>
          ) : (
            // TODO: To implement. Estimated activity time is not in scope of MVP.
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

      {txHash && (
        <BlockExplorerLink
          id={txHash}
          chain="bitcoin"
          type="transaction"
          display="flex"
          my={-4}
          ml={6}
          mr={-6}
          h="auto"
          alignSelf="stretch"
          borderLeftWidth={1}
          borderColor="inherit"
          rounded={0}
          px={4}
          py={5}
        >
          <ArrowUpRight color="gray.500" boxSize={4} alignSelf="center" />
          <VisuallyHidden>View transaction details</VisuallyHidden>
        </BlockExplorerLink>
      )}
    </Alert>
  )
}

export default ActivitiesListItem
