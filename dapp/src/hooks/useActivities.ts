import { useCallback, useState } from "react"
import { mockedActivities } from "#/mock"

export function useActivities() {
  // TODO: should be replaced by redux store when subgraphs are implemented
  const [activities, setActivities] = useState(mockedActivities)

  const getActivity = useCallback(
    (activityId?: string) =>
      activities.find((_activity) => _activity.txHash === activityId),
    [activities],
  )

  const onRemove = useCallback(
    (activityHash: string) => {
      const filteredActivities = activities.filter(
        (activity) => activity.txHash !== activityHash,
      )
      setActivities(filteredActivities)
    },
    [activities],
  )

  return { activities, getActivity, onRemove }
}
