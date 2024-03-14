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
import { useNavigate } from "react-router-dom"
import { ActivityInfo } from "#/types"
import { ChevronRightIcon } from "#/assets/icons"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import StatusInfo from "#/components/shared/StatusInfo"
import { TextSm } from "#/components/shared/Typography"
import { routerPath } from "#/router/path"
import { ActivityCardWrapper } from "./ActivityCardWrapper"

type ActivityCardType = CardProps & {
  activity: ActivityInfo
  onRemove: (txHash: string) => void
  isActive?: boolean
}

export function ActivityCard({
  activity,
  onRemove,
  isActive,
}: ActivityCardType) {
  const navigate = useNavigate()
  const isCompleted = activity.status === "completed"

  const onClick = useCallback(() => {
    navigate(`${routerPath.activity}/${activity.txHash}`)
  }, [activity.txHash, navigate])

  const onClose = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      if (activity.txHash) {
        onRemove(activity.txHash)
      }
    },
    [onRemove, activity.txHash],
  )

  return (
    <ActivityCardWrapper
      isCompleted={isCompleted}
      isActive={isActive}
      onClick={onClick}
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
  )
}
