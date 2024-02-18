import React, { useCallback, useState } from "react"
import { Link as ReactRouterLink } from "react-router-dom"
import { Flex, Link as ChakraLink, FlexboxProps } from "@chakra-ui/react"
import ActivityCard from "./ActivityCard"
import { mockedActivities } from "./mock-activities"

function ActivityBar(props: FlexboxProps) {
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
    <Flex gap={3} {...props}>
      {activities.map((activity) => (
        <ChakraLink
          as={ReactRouterLink}
          to="/activity-details"
          state={{ activity }}
          key={activity.txHash}
        >
          <ActivityCard activity={activity} onRemove={onRemove} />
        </ChakraLink>
      ))}
    </Flex>
  )
}

export default ActivityBar
