import React, { useCallback } from "react"
import { useLocation } from "react-router-dom"
import { ActivityInfo, LocationState } from "#/types"
import { CardProps, Card } from "@chakra-ui/react"
import ActivityCard from "./ActivityCard"

type ActivityCardType = CardProps & {
  activity: ActivityInfo
  onRemove: (activityHash: string) => void
}

const completedStyles = {
  bg: "green.200",
  borderColor: "green.100",
  _hover: {
    boxShadow: "lg",
    bg: "green.200",
    borderColor: "green.100",
  },
}

const activeStyles = {
  boxShadow: "lg",
  bg: "gold.100",
  borderColor: "white",
}

function ActivityCardContainer({
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
    <Card
      {...props}
      // colorScheme={isCompleted ? "green" : undefined}
      width={64}
      paddingX={5}
      padding={3}
      borderWidth={1}
      borderColor="gold.100"
      _hover={{
        boxShadow: "lg",
        bg: "gold.100",
        borderColor: "white",
      }}
      {...(isActive && activeStyles)}
      {...(isCompleted && completedStyles)}
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
      <ActivityCard
        activity={activity}
        isCompleted={isCompleted}
        isActive={isActive}
        onClose={onClose}
      />
    </Card>
  )
}

export default ActivityCardContainer
