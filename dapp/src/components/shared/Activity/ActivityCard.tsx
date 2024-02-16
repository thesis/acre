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
import { ActivityInfo, LocationState } from "#/types"
import { capitalize } from "#/utils"
import { ChevronRightIcon } from "#/assets/icons"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import StatusInfo from "#/components/shared/StatusInfo"
import { TextSm } from "#/components/shared/Typography"

type ActivityCardType = CardProps & {
  activity: ActivityInfo
  onRemove: (activityHash: string) => void
}

function ActivityCard({ activity, onRemove, ...props }: ActivityCardType) {
  let colorScheme

  const state = useLocation().state as LocationState | null
  const isActive = state ? activity.txHash === state.activity.txHash : false
  const isCompleted = activity.status === "completed"

  if (isCompleted) {
    colorScheme = "green"
  } else if (isActive) {
    colorScheme = "gold"
  }

  const onClose = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      if (activity.txHash) {
        onRemove(activity.txHash)
      }
    },
    [onRemove, activity.txHash],
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
            currency={activity.currency}
            amount={activity.amount}
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
          {capitalize(activity.action)}
        </TextSm>
      </CardBody>
      <CardFooter p={0}>
        {" "}
        {activity.status && (
          <StatusInfo
            status={activity.status}
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
