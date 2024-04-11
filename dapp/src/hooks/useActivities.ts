import { useCallback, useState } from "react"
import { mockedActivities } from "#/mock"
import { useParams } from "react-router-dom"
import { ActivityInfo } from "#/types"

export function useActivities() {
  // TODO: should be replaced by redux store when subgraphs are implemented
  const [activities, setActivities] = useState<ActivityInfo[]>(mockedActivities)
  const params = useParams()

  const getActivity = useCallback(
    (activityId?: string) =>
      activities.find((_activity) => _activity.txHash === activityId),
    [activities],
  )

  const removeActivity = useCallback(
    (activity: ActivityInfo) => {
      const filteredActivities = activities.filter(
        (_activity) => _activity.txHash !== activity.txHash,
      )
      setActivities(filteredActivities)
    },
    [activities],
  )

  const selectedActivity = useCallback(
    () => getActivity(params.activityId),
    [getActivity, params.activityId],
  )

  const isSelected = useCallback(
    (activity: ActivityInfo): boolean =>
      activity.txHash === getActivity(params.activityId)?.txHash,
    [getActivity, params.activityId],
  )

  const isCompleted = useCallback(
    (activity: ActivityInfo): boolean => activity.status === "completed",
    [],
  )

  return {
    activities,
    getActivity,
    removeActivity,
    selectedActivity,
    isCompleted,
    isSelected,
  }
}
