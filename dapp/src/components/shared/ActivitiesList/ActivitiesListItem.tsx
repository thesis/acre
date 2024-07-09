import React from "react"
import { ArrowUpRight, LoadingSpinnerSuccessIcon } from "#/assets/icons"
import { Activity as ActivityType } from "#/types"
import { Button, HStack, VStack, VisuallyHidden } from "@chakra-ui/react"
import { CurrencyBalance } from "../CurrencyBalance"
import BlockExplorerLink from "../BlockExplorerLink"
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertProps,
  AlertTitle,
} from "../Alert"
import { TextMd } from "../Typography"

type ActivitiesListItemProps = Omit<AlertProps, "status"> &
  ActivityType & {
    handleDismiss?: () => void
  }

function ActivitiesListItem(props: ActivitiesListItemProps) {
  const { amount, status, txHash, type, handleDismiss, ...restProps } = props

  const isCompleted = status === "completed"

  return (
    <Alert w="full" variant="process" {...restProps}>
      {isCompleted ? (
        <AlertIcon as={LoadingSpinnerSuccessIcon} borderWidth={0} />
      ) : (
        <AlertIcon status="loading" variant="filled" />
      )}

      <VStack flex={1} spacing={0} align="stretch">
        <AlertTitle justify="space-between" as={HStack}>
          <TextMd fontWeight="bold">
            {isCompleted
              ? `${type === "withdraw" ? "Unstaking" : "Staking"} completed`
              : `${type === "withdraw" ? "Unstaking" : "Staking"}...`}
          </TextMd>

          <CurrencyBalance amount={amount} currency="bitcoin" />
        </AlertTitle>

        <AlertDescription justify="space-between" as={HStack}>
          {isCompleted ? (
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
        </AlertDescription>
      </VStack>

      {txHash && status === "pending" && (
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
