import React from "react"
import { VStack } from "@chakra-ui/react"
import { ActivityCard } from "#/components/shared/ActivityCard"
import { useActivities } from "#/hooks"

export function ActivityBar() {
  const { activities, removeActivity } = useActivities()

  return (
    <VStack gap={3}>
      {activities.map((activity) => (
        <ActivityCard
          key={activity.txHash}
          activity={activity}
          onRemove={removeActivity}
        />
      ))}
    </VStack>
  )
}
