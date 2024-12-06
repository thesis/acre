import useActivities from "./useActivities"

export default function useActivitiesCount() {
  const { data } = useActivities()
  return data ? data.length : 0
}
