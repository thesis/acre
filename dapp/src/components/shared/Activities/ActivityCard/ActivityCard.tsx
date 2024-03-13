import React, { useCallback } from "react"
import {
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  HStack,
  Icon,
  Tooltip,
  CloseButton,
} from "@chakra-ui/react"
import { useLocation } from "react-router-dom"
import { ActivityInfo, LocationState } from "#/types"
import { ChevronRightIcon } from "#/assets/icons"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import StatusInfo from "#/components/shared/StatusInfo"
import { TextSm } from "#/components/shared/Typography"
import { ActivityCardWrapper } from "./ActivityCardWrapper"
import { ActivityCardLinkWrapper } from "./ActivityCardLinkWrapper"

type ActivityCardType = CardProps & {
  activity: ActivityInfo
  onRemove: (txHash: string) => void
}

export function ActivityCard({
  activity,
  onRemove,
  ...props
}: ActivityCardType) {
  const state = useLocation().state as LocationState | null
  const isActive = state ? activity.txHash === state.activity.txHash : false
  const isCompleted = activity.status === "completed"

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
    <ActivityCardLinkWrapper activity={activity} {...props}>
      <ActivityCardWrapper isCompleted={isCompleted} isActive={isActive}>
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
                <CloseButton
                  size="sm"
                  onClick={onClose}
                  _hover={{ backgroundColor: undefined }}
                />
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
        <CardBody p={0} pb={4}>
          <TextSm fontWeight="semibold" textTransform="capitalize">
            {activity.action}
          </TextSm>
        </CardBody>
        <CardFooter p={0}>
          <StatusInfo
            status={activity.status}
            withIcon
            withDefaultColor
            fontWeight="medium"
          />
        </CardFooter>
      </ActivityCardWrapper>
    </ActivityCardLinkWrapper>
  )
}
