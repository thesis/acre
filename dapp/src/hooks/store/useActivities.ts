import { selectActivities, selectHasPendingActivities } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

export default function useActivities() {
  const activities = useAppSelector(selectActivities)
  const hasPendingActivities = useAppSelector(selectHasPendingActivities)

  return { activities, hasPendingActivities }
}
