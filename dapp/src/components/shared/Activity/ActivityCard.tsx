import React, { useCallback } from "react"
import { useLocation } from "react-router-dom"
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  HStack,
  Icon,
  Tooltip,
  CloseButton,
} from "@chakra-ui/react"
import { TransactionInfo, LocationState } from "#/types"
import { capitalize } from "#/utils"
import { ChevronRightIcon } from "#/assets/icons"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import StatusInfo from "#/components/shared/StatusInfo"
import { TextSm } from "#/components/shared/Typography"

type ActivityCardType = CardProps & {
  transaction: TransactionInfo
  onRemove: (transactionHash: string) => void
}

function ActivityCard({ transaction, onRemove, ...props }: ActivityCardType) {
  let colorScheme

  const state = useLocation().state as LocationState | null
  const isActive = state
    ? transaction.txHash === state.transaction.txHash
    : false
  const isCompleted = transaction.status === "completed"

  if (isCompleted) {
    colorScheme = "green"
  } else if (isActive) {
    colorScheme = "gold"
  }

  const onClose = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      if (transaction.txHash) {
        onRemove(transaction.txHash)
      }
    },
    [onRemove, transaction.txHash],
  )

  return (
    <Card
      {...props}
      variant="activity"
      colorScheme={colorScheme}
      _before={
        isActive
          ? {
              content: '""',
              bg: "gold.700",
              position: "absolute",
              left: -1.5,
              top: 0,
              bottom: 0,
              right: 0,
              borderRadius: 12,
              zIndex: -1,
            }
          : undefined
      }
    >
      <CardHeader p={0} w="100%">
        <HStack justifyContent="space-between">
          <CurrencyBalance
            currency={transaction.currency}
            amount={transaction.amount}
            size="xl"
            balanceFontWeight="black"
            symbolFontWeight="medium"
          />
          {isCompleted ? (
            <Tooltip label="Remove" placement="top" paddingX={3} paddingY={2}>
              <CloseButton size="sm" onClick={onClose} />
            </Tooltip>
          ) : (
            <Icon
              as={ChevronRightIcon}
              boxSize={5}
              color={isActive ? "gold.700" : "grey.400"}
              _hover={isActive ? { color: "gold.700" } : undefined}
            />
          )}
        </HStack>
      </CardHeader>
      <CardBody p={0}>
        <TextSm fontWeight="semibold" marginBottom={4}>
          {capitalize(transaction.action)}
        </TextSm>
      </CardBody>
      <CardFooter p={0}>
        {" "}
        {transaction.status && (
          <StatusInfo
            status={transaction.status}
            withIcon
            withDefaultColor
            fontWeight="normal"
          />
        )}
      </CardFooter>
    </Card>
  )
}

export default ActivityCard
