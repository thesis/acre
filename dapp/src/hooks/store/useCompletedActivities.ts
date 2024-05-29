import { selectCompletedActivities } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

export function useCompletedActivities() {
  return useAppSelector(selectCompletedActivities)
}
