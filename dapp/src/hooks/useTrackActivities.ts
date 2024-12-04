import { useEffect } from "react"
import { setActivities } from "#/store/wallet"
import { useActivitiesQuery } from "./tanstack-query"
import { useAppDispatch } from "./store"

export default function useTrackActivities() {
  const { data } = useActivitiesQuery()
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setActivities(data ?? []))
  }, [data, dispatch])
}
