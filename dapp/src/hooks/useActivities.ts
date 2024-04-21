/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { useCallback, useEffect, useState } from "react"
// import { mockedActivities } from "#/mock"
import { useParams } from "react-router-dom"
import { ActivityInfo } from "#/types"
import { GET_ACTIVITIES } from "#/queries"
import { useQuery } from "@apollo/client"

export function useActivities() {
  // TODO: should be replaced by redux store when subgraphs are implemented
  const { loading, error, data } = useQuery(GET_ACTIVITIES)
  const [activities, setActivities] = useState<ActivityInfo[]>(
    data?.activityDatas || [],
  )

  useEffect(() => {
    data && setActivities(data.activityDatas)
  }, [data])

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
