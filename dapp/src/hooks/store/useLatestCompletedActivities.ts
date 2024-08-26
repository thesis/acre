import { selectLatestCompletedActivities } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

export default function useLatestCompletedActivities() {
  return useAppSelector(selectLatestCompletedActivities)
}
