import React, { useCallback, useState } from "react"
import { VStack } from "@chakra-ui/react"
import { mockedActivities } from "#/components/shared/ActivityCard/mock-activities"
import { ActivityCard } from "#/components/shared/ActivityCard"
import { ActivityInfo } from "#/types"

export function ActivityBar({ activity }: { activity: ActivityInfo }) {
  // TODO: Lines 8-18 should be replaced by redux store when subgraphs are implemented
  const [activities, setActivities] = useState(mockedActivities)

  const onRemove = useCallback(
    (activityHash: string) => {
      const filteredActivities = activities.filter(
        (_activity) => _activity.txHash !== activityHash,
      )
      setActivities(filteredActivities)
    },
    [activities],
  )

  return (
    <VStack gap={3}>
      {activities.map((_activity) => (
        <ActivityCard
          key={_activity.txHash}
          activity={_activity}
          onRemove={onRemove}
          isActive={_activity.txHash === activity.txHash}
        />
      ))}
    </VStack>
  )
}
