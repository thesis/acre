import React, { useCallback, useState } from "react"
import { VStack } from "@chakra-ui/react"
import { ActivityCard } from "../../components/shared/ActivityCard"
import { mockedActivities } from "../../components/shared/ActivityCard/mock-activities"

export function ActivityBar() {
  // TODO: Lines 8-18 should be replaced by redux store when subgraphs are implemented
  const [activities, setActivities] = useState(mockedActivities)

  const onRemove = useCallback(
    (activityHash: string) => {
      const filteredActivities = activities.filter(
        (activity) => activity.txHash !== activityHash,
      )
      setActivities(filteredActivities)
    },
    [activities],
  )

  return (
    <VStack gap={3}>
      {activities.map((activity) => (
        <ActivityCard
          key={activity.txHash}
          activity={activity}
          onRemove={onRemove}
        />
      ))}
    </VStack>
  )
}
