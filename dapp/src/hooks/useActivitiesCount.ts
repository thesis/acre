import { useActivitiesQuery } from "./tanstack-query"

export default function useActivitiesCount() {
  const { data } = useActivitiesQuery()
  return data ? data.length : 0
}
