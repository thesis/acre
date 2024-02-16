import React from "react"
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
import { ActivityInfo } from "#/types"
import { capitalize } from "#/utils"
import { ChevronRightIcon } from "#/assets/icons"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import StatusInfo from "#/components/shared/StatusInfo"
import { TextSm } from "#/components/shared/Typography"

type ActivityCardType = CardProps & {
  activity: ActivityInfo
  isCompleted: boolean
  isActive: boolean
  onClose: (event: React.MouseEvent) => void
}

function ActivityCard({
  activity,
  isCompleted,
  isActive,
  onClose,
}: ActivityCardType) {
  return (
    <>
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
        {activity.status && (
          <StatusInfo
            status={activity.status}
            withIcon
            withDefaultColor
            fontWeight="normal"
          />
        )}
      </CardFooter>
    </>
  )
}

export default ActivityCard
